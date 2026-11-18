export type CatalogFilters = {
  query: string;
  category: string;
};

let state: CatalogFilters = { query: "", category: "all" };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const catalogFilters = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return state;
  },
  getServerSnapshot() {
    return state;
  },
  setQuery(query: string) {
    state = { ...state, query };
    emit();
  },
  setCategory(category: string) {
    state = { ...state, category };
    emit();
  },
  set(next: Partial<CatalogFilters>) {
    state = { ...state, ...next };
    emit();
  },
  reset() {
    state = { query: "", category: "all" };
    emit();
  },
};
