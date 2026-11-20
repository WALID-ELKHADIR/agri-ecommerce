import assert from "node:assert/strict";
import { test } from "node:test";
import { createQuoteListStore, QUOTE_LIST_KEY, type StorageLike } from "../lib/quote-list-store.ts";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

const A = { slug: "a", name: "Pompe A" };

test("ajouter deux fois le même produit additionne les quantités", () => {
  const store = createQuoteListStore(() => memoryStorage());
  store.add(A);
  store.add(A);
  assert.deepEqual(store.getSnapshot(), [{ slug: "a", name: "Pompe A", quantity: 2 }]);
  assert.equal(store.count(), 2);
});

test("la quantité est bornée à 99", () => {
  const store = createQuoteListStore(() => memoryStorage());
  store.add(A, 150);
  assert.equal(store.getSnapshot()[0].quantity, 99);
  store.setQuantity("a", 500);
  assert.equal(store.getSnapshot()[0].quantity, 99);
});

test("au plus 50 produits distincts", () => {
  const store = createQuoteListStore(() => memoryStorage());
  for (let i = 0; i < 51; i++) store.add({ slug: `p${i}`, name: `P${i}` });
  assert.equal(store.getSnapshot().length, 50);
});

test("quantité 0 retire la ligne ; retirer et vider", () => {
  const store = createQuoteListStore(() => memoryStorage());
  store.add(A);
  store.add({ slug: "b", name: "B" });
  store.setQuantity("a", 0);
  assert.deepEqual(store.getSnapshot().map((l) => l.slug), ["b"]);
  store.remove("b");
  assert.equal(store.getSnapshot().length, 0);
  store.add(A);
  store.clear();
  assert.equal(store.count(), 0);
});

test("la liste est relue depuis le stockage", () => {
  const storage = memoryStorage();
  createQuoteListStore(() => storage).add(A, 3);
  const again = createQuoteListStore(() => storage);
  assert.deepEqual(again.getSnapshot(), [{ slug: "a", name: "Pompe A", quantity: 3 }]);
});

test("un stockage corrompu donne une liste vide, sans erreur", () => {
  const store = createQuoteListStore(() => memoryStorage({ [QUOTE_LIST_KEY]: "{pas du json" }));
  assert.deepEqual(store.getSnapshot(), []);
  const mixed = createQuoteListStore(() =>
    memoryStorage({ [QUOTE_LIST_KEY]: JSON.stringify([{ slug: "a", name: "A", quantity: 2 }, { slug: 3 }, null]) }),
  );
  assert.deepEqual(mixed.getSnapshot(), [{ slug: "a", name: "A", quantity: 2 }]);
});

test("un stockage qui lève une exception : la liste marche en mémoire", () => {
  const broken: StorageLike = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
    removeItem: () => {
      throw new Error("x");
    },
  };
  const store = createQuoteListStore(() => broken);
  store.add(A);
  assert.equal(store.count(), 1);
  store.clear();
  assert.equal(store.count(), 0);
});

test("sans stockage (null) : la liste marche en mémoire", () => {
  const store = createQuoteListStore(() => null);
  store.add(A, 2);
  assert.equal(store.count(), 2);
});

test("une ligne garde son nom même si le produit a disparu du catalogue", () => {
  const storage = memoryStorage({ [QUOTE_LIST_KEY]: JSON.stringify([{ slug: "retire", name: "Ancien produit", quantity: 1 }]) });
  assert.equal(createQuoteListStore(() => storage).getSnapshot()[0].name, "Ancien produit");
});

test("instantané stable et abonnés prévenus", () => {
  const store = createQuoteListStore(() => memoryStorage());
  assert.equal(store.getSnapshot(), store.getSnapshot());
  assert.equal(store.getServerSnapshot(), store.getServerSnapshot());
  let calls = 0;
  const unsubscribe = store.subscribe(() => calls++);
  store.add(A);
  const first = store.getSnapshot();
  assert.equal(store.getSnapshot(), first);
  unsubscribe();
  store.add(A);
  assert.equal(calls, 1);
});

test("synchronisation depuis un autre onglet", () => {
  const storage = memoryStorage();
  const store = createQuoteListStore(() => storage);
  storage.data[QUOTE_LIST_KEY] = JSON.stringify([{ slug: "z", name: "Z", quantity: 4 }]);
  store.syncFromStorage();
  assert.equal(store.count(), 4);
});
