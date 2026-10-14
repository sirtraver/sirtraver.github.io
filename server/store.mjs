// Key-value stores with the subset of the Workers KV API the site uses:
// get(key, 'json'?), put(key, value), list({ prefix, cursor }).
import fs from 'node:fs/promises';
import path from 'node:path';

function api(values, persist = async () => {}) {
  return {
    async get(key, type) {
      if (!values.has(key)) return null;
      return type === 'json' ? JSON.parse(values.get(key)) : values.get(key);
    },
    async put(key, value) {
      values.set(key, String(value));
      await persist();
    },
    async delete(key) {
      values.delete(key);
      await persist();
    },
    async list({ prefix = '' } = {}) {
      const keys = [...values.keys()].filter((name) => name.startsWith(prefix)).sort();
      return { keys: keys.map((name) => ({ name })), list_complete: true };
    },
  };
}

export const createMemoryStore = () => api(new Map());

/** Persists everything to one JSON file, written atomically after each change. */
export async function createFileStore(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const values = new Map(Object.entries(JSON.parse(await fs.readFile(file, 'utf8').catch(() => '{}'))));
  let writing = Promise.resolve();
  const persist = () => {
    writing = writing.then(async () => {
      const temporary = `${file}.tmp`;
      await fs.writeFile(temporary, JSON.stringify(Object.fromEntries(values), null, 1));
      await fs.rename(temporary, file);
    });
    return writing;
  };
  return { ...api(values, persist), flush: () => writing };
}
