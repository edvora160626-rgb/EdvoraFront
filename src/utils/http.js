import axios from "axios";

/** Shared defaults so hung API calls fail instead of freezing the UI. */
axios.defaults.timeout = 15000;
axios.defaults.withCredentials = true;

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

export function createTtlCache(ttlMs = 45000) {
  const store = new Map();
  const inflight = new Map();

  return {
    wrap(key, loader) {
      const hit = store.get(key);
      if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.data);
      if (inflight.has(key)) return inflight.get(key);

      const pending = Promise.resolve()
        .then(loader)
        .then((data) => {
          store.set(key, { data, at: Date.now() });
          return data;
        })
        .finally(() => inflight.delete(key));

      inflight.set(key, pending);
      return pending;
    },
    clear() {
      store.clear();
      inflight.clear();
    },
  };
}

export default axios;
