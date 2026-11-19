// Vérifie les policies RLS de supabase/migrations/ dans un vrai Postgres
// (PGlite, en mémoire), sans projet Supabase. Le schéma `auth`, les rôles
// `anon` / `authenticated` et les droits par défaut de Supabase sont simulés.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const MIGRATIONS = join("supabase", "migrations");
const ADMIN = "00000000-0000-0000-0000-00000000000a";
const USER = "00000000-0000-0000-0000-00000000000b";
const INSERT_QUOTE =
  "insert into public.quote_requests (name, phone, source) values ('Test', $1, 'rls-test')";

const db = new PGlite({ extensions: { pgcrypto } });

type Role = "anon" | "authenticated";

async function as<T>(role: Role, uid: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  await db.exec(`set role ${role};`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role;");
  }
}

async function rows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows;
}

async function affected(sql: string): Promise<number> {
  return (await db.query(sql)).affectedRows ?? 0;
}

/** Message d'erreur Postgres, ou `null` si la requête a réussi. */
async function error(sql: string, params: unknown[] = []): Promise<string | null> {
  try {
    await db.query(sql, params);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

async function isAdmin(): Promise<boolean> {
  return (await rows<{ a: boolean }>("select public.is_admin() as a"))[0].a;
}

before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on functions to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    insert into auth.users values ('${ADMIN}', 'admin@test'), ('${USER}', 'user@test');
  `);

  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  // Deux passes : chaque migration doit pouvoir être relancée sans erreur.
  for (let pass = 0; pass < 2; pass++) {
    for (const file of files) {
      await db.exec(readFileSync(join(MIGRATIONS, file), "utf8"));
    }
  }

  await db.exec(`
    insert into public.admin_users (user_id) values ('${ADMIN}');
    insert into public.products (slug, name, category_id, image_url, published)
      values ('brouillon', 'Brouillon', 'pompes', '/x.jpg', false);
  `);
});

after(() => db.close());

describe("visiteur anonyme", () => {
  test("lit les catégories et uniquement les produits publiés", async () => {
    await as("anon", null, async () => {
      assert.ok((await rows("select id from public.categories")).length > 0);
      const products = await rows<{ slug: string; published: boolean }>(
        "select slug, published from public.products",
      );
      assert.ok(products.length > 0);
      assert.ok(products.every((p) => p.published));
    });
  });

  test("peut envoyer une demande mais ne lit aucune demande", async () => {
    await as("anon", null, async () => {
      assert.equal(await error(INSERT_QUOTE, ["0611111111"]), null);
      assert.equal((await rows("select id from public.quote_requests")).length, 0);
    });
  });

  test("ne peut ni modifier le catalogue ni lire admin_users", async () => {
    await as("anon", null, async () => {
      assert.equal(await isAdmin(), false);
      assert.notEqual(await error("select * from public.admin_users"), null);
      await error("update public.products set name = 'pirate'");
    });
    assert.equal((await rows("select id from public.products where name = 'pirate'")).length, 0);
  });

  test("est limité à 3 demandes par téléphone en 10 minutes", async () => {
    await as("anon", null, async () => {
      for (let i = 0; i < 3; i++) assert.equal(await error(INSERT_QUOTE, ["0622222222"]), null);
      assert.match((await error(INSERT_QUOTE, ["0622222222"])) ?? "", /rate_limited/);
    });
  });

  test("ne peut pas dépasser les tailles maximales ni envoyer des items mal formés", async () => {
    await as("anon", null, async () => {
      assert.notEqual(await error("insert into public.quote_requests (name) values (repeat('a', 121))"), null);
      assert.notEqual(await error(`insert into public.quote_requests (items) values ('{"a":1}')`), null);
      assert.equal(
        await error(
          `insert into public.quote_requests (phone, items) values ('0633333333', '[{"slug":"x","name":"X","quantity":2}]')`,
        ),
        null,
      );
    });
  });
});

describe("utilisateur connecté non-admin", () => {
  test("n'est pas admin et ne peut rien modifier", async () => {
    await as("authenticated", USER, async () => {
      assert.equal(await isAdmin(), false);
      assert.equal(await affected("update public.products set position = position"), 0);
      assert.equal(await affected("delete from public.categories"), 0);
      assert.notEqual(
        await error(
          "insert into public.products (slug, name, category_id, image_url) values ('z', 'z', 'pompes', '/z')",
        ),
        null,
      );
    });
  });

  test("ne lit ni les demandes ni les brouillons", async () => {
    await as("authenticated", USER, async () => {
      assert.equal((await rows("select id from public.quote_requests")).length, 0);
      const slugs = await rows<{ slug: string }>("select slug from public.products");
      assert.ok(!slugs.some((p) => p.slug === "brouillon"));
    });
  });
});

describe("administrateur", () => {
  test("lit et gère les demandes, voit les brouillons", async () => {
    await as("authenticated", ADMIN, async () => {
      assert.equal(await isAdmin(), true);
      assert.ok((await rows("select id from public.quote_requests")).length > 0);
      const slugs = await rows<{ slug: string }>("select slug from public.products");
      assert.ok(slugs.some((p) => p.slug === "brouillon"));
      assert.equal(await affected("update public.products set position = position where slug = 'brouillon'"), 1);
      assert.ok((await affected("update public.quote_requests set status = 'contacted'")) > 0);
    });
  });

  test("n'est pas limité en débit", async () => {
    await as("authenticated", ADMIN, async () => {
      for (let i = 0; i < 5; i++) assert.equal(await error(INSERT_QUOTE, ["0644444444"]), null);
    });
  });
});
