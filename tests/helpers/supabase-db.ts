// Base Postgres en mémoire (PGlite) qui imite Supabase : schéma `auth`, rôles
// `anon` / `authenticated`, droits par défaut, puis toutes les migrations de
// supabase/migrations/ appliquées deux fois (chacune doit pouvoir être relancée).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const MIGRATIONS = join("supabase", "migrations");

export const ADMIN_ID = "00000000-0000-0000-0000-00000000000a";
export const USER_ID = "00000000-0000-0000-0000-00000000000b";

export async function createSupabaseDb(): Promise<PGlite> {
  const db = new PGlite({ extensions: { pgcrypto } });
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
    insert into auth.users values ('${ADMIN_ID}', 'admin@test'), ('${USER_ID}', 'user@test');
  `);

  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  for (let pass = 0; pass < 2; pass++) {
    for (const file of files) {
      await db.exec(readFileSync(join(MIGRATIONS, file), "utf8"));
    }
  }
  return db;
}
