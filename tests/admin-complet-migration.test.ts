// Droits de la migration de la phase 3 (Storage, galerie, réglages, catégories).
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import type { PGlite } from "@electric-sql/pglite";
import { ADMIN_ID, createSupabaseDb, USER_ID } from "./helpers/supabase-db.ts";

let db: PGlite;

async function as<T>(role: "anon" | "authenticated", uid: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  await db.exec(`set role ${role};`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role;");
  }
}

async function error(sql: string, params: unknown[] = []): Promise<string | null> {
  try {
    await db.query(sql, params);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

async function count(sql: string): Promise<number> {
  return (await db.query<{ n: number }>(sql)).rows[0].n;
}

const INSERT_OBJECT = "insert into storage.objects (bucket_id, name) values ('product-images', $1)";

before(async () => {
  db = await createSupabaseDb();
  await db.exec(`
    insert into public.admin_users (user_id) values ('${ADMIN_ID}');
    insert into storage.objects (bucket_id, name) values ('product-images', 'te-pvc-pression/main-abc.webp');
    update public.products set published = false where slug = 'colle-pvc';
    insert into public.product_images (product_id, url, alt, position, is_main)
      select id, '/a.webp', 'A', 0, true from public.products where slug in ('te-pvc-pression', 'colle-pvc');
  `);
});

after(() => db.close());

describe("bucket product-images", () => {
  test("existe et est public", async () => {
    const { rows } = await db.query<{ public: boolean }>("select public from storage.buckets where id = 'product-images'");
    assert.equal(rows[0]?.public, true);
  });

  test("lecture pour tous, écriture réservée aux administrateurs", async () => {
    await as("anon", null, async () => {
      assert.equal(await count("select count(*)::int as n from storage.objects where bucket_id = 'product-images'"), 1);
      assert.notEqual(await error(INSERT_OBJECT, ["pirate.webp"]), null);
    });
    await as("authenticated", USER_ID, async () => {
      assert.notEqual(await error(INSERT_OBJECT, ["pirate.webp"]), null);
      assert.equal((await db.query("delete from storage.objects where bucket_id = 'product-images'")).affectedRows, 0);
    });
    await as("authenticated", ADMIN_ID, async () => {
      assert.equal(await error(INSERT_OBJECT, ["admin/nouvelle.webp"]), null);
      assert.equal(
        (await db.query("delete from storage.objects where name = 'admin/nouvelle.webp'")).affectedRows,
        1,
      );
    });
  });
});

describe("galerie product_images", () => {
  test("le public ne voit que les images des produits publiés", async () => {
    await as("anon", null, async () => {
      assert.equal(await count("select count(*)::int as n from public.product_images"), 1);
    });
    await as("authenticated", ADMIN_ID, async () => {
      assert.equal(await count("select count(*)::int as n from public.product_images"), 2);
    });
  });

  test("seul un administrateur peut la modifier", async () => {
    const insert = "insert into public.product_images (product_id, url, alt, position) select id, '/x.webp', 'X', 1 from public.products where slug = 'te-pvc-pression'";
    await as("authenticated", USER_ID, async () => assert.notEqual(await error(insert), null));
    await as("authenticated", ADMIN_ID, async () => assert.equal(await error(insert), null));
  });

  test("une seule image principale par produit", async () => {
    const second = "insert into public.product_images (product_id, url, alt, position, is_main) select id, '/y.webp', 'Y', 2, true from public.products where slug = 'te-pvc-pression'";
    assert.notEqual(await error(second), null);
  });
});

describe("réglages", () => {
  test("lisibles par tous, modifiables seulement par un administrateur", async () => {
    await as("anon", null, async () => {
      assert.ok((await count("select count(*)::int as n from public.settings")) >= 1);
      // La RLS filtre : la mise à jour ne touche aucune ligne.
      assert.equal((await db.query("update public.settings set value = '{}' where key = 'contact'")).affectedRows, 0);
    });
    await as("authenticated", USER_ID, async () => {
      assert.equal((await db.query("update public.settings set value = '{}' where key = 'contact'")).affectedRows, 0);
    });
    await as("authenticated", ADMIN_ID, async () => {
      assert.equal((await db.query(`update public.settings set value = '{"email":"a@b.ma"}' where key = 'contact'`)).affectedRows, 1);
    });
  });
});

describe("catégories", () => {
  test("ont une image facultative", async () => {
    assert.equal(await error("select image_url from public.categories limit 1"), null);
  });

  test("une gamme qui contient des produits ne peut pas être supprimée", async () => {
    const message = await error("delete from public.categories where id = 'pompes'");
    assert.match(message ?? "", /foreign key|violates/i);
  });
});
