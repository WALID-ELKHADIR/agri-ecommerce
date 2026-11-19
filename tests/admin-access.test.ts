import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveAdminAccess } from "../lib/admin-access.ts";

test("visiteur non connecté : renvoyé vers la connexion, sauf sur la page de connexion", () => {
  assert.equal(resolveAdminAccess({ hasUser: false, role: "unknown", isLoginPage: false }), "redirect-login");
  assert.equal(resolveAdminAccess({ hasUser: false, role: "unknown", isLoginPage: true }), "allow");
});

test("utilisateur connecté non-admin : déconnecté et refusé, où qu'il soit", () => {
  assert.equal(resolveAdminAccess({ hasUser: true, role: "not-admin", isLoginPage: false }), "signout-forbidden");
  assert.equal(resolveAdminAccess({ hasUser: true, role: "not-admin", isLoginPage: true }), "signout-forbidden");
});

test("administrateur : accès autorisé, et renvoyé vers le tableau de bord depuis la connexion", () => {
  assert.equal(resolveAdminAccess({ hasUser: true, role: "admin", isLoginPage: false }), "allow");
  assert.equal(resolveAdminAccess({ hasUser: true, role: "admin", isLoginPage: true }), "redirect-admin");
});

test("rôle impossible à vérifier : accès refusé SANS déconnexion, et sans boucle sur la connexion", () => {
  assert.equal(resolveAdminAccess({ hasUser: true, role: "unknown", isLoginPage: false }), "redirect-unavailable");
  assert.equal(resolveAdminAccess({ hasUser: true, role: "unknown", isLoginPage: true }), "allow");
});
