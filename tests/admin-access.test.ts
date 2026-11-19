import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveAdminAccess } from "../lib/admin-access.ts";

test("visiteur non connecté : renvoyé vers la connexion, sauf sur la page de connexion", () => {
  assert.equal(resolveAdminAccess({ hasUser: false, isAdmin: false, isLoginPage: false }), "redirect-login");
  assert.equal(resolveAdminAccess({ hasUser: false, isAdmin: false, isLoginPage: true }), "allow");
});

test("utilisateur connecté non-admin : déconnecté et refusé, où qu'il soit", () => {
  assert.equal(resolveAdminAccess({ hasUser: true, isAdmin: false, isLoginPage: false }), "signout-forbidden");
  assert.equal(resolveAdminAccess({ hasUser: true, isAdmin: false, isLoginPage: true }), "signout-forbidden");
});

test("administrateur : accès autorisé, et renvoyé vers le tableau de bord depuis la connexion", () => {
  assert.equal(resolveAdminAccess({ hasUser: true, isAdmin: true, isLoginPage: false }), "allow");
  assert.equal(resolveAdminAccess({ hasUser: true, isAdmin: true, isLoginPage: true }), "redirect-admin");
});
