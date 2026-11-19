import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { test } from "node:test";

const ROOTS = ["app", "components", "lib", "supabase", "docs", "README.md"];
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".sql", ".md", ".json"]);
// Séquences typiques d'un texte UTF-8 relu en Latin-1 / Windows-1252.
// « Â » seul n'est pas visé (CHÂTEAU, ÂGE) : seulement suivi d'un octet 0x80–0xBF.
const MOJIBAKE = /Ã|Â[\u0080-¿]|â€|ðŸ/;

function listFiles(path: string): string[] {
  if (statSync(path).isFile()) {
    return EXTENSIONS.has(extname(path)) ? [path] : [];
  }
  return readdirSync(path).flatMap((entry) => listFiles(join(path, entry)));
}

test("aucun fichier source ne contient de texte mal encodé", () => {
  const offenders: string[] = [];

  for (const file of ROOTS.flatMap(listFiles)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (MOJIBAKE.test(line)) offenders.push(`${file}:${index + 1}`);
      });
  }

  assert.deepEqual(offenders, [], `Encodage cassé :\n${offenders.join("\n")}`);
});
