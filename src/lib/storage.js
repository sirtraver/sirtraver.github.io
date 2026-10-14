// Sites retains its existing R2 BUCKET and waitlist keys. Node previews supply KV.
// This small adapter keeps both runtimes on the same service implementation.
export function storageEnv(env) {
  if (env.KV || !env.BUCKET) return env;
  const bucket = env.BUCKET;
  return {
    ...env,
    KV: {
      async get(key, type) {
        const object = await bucket.get(key);
        if (!object) return null;
        return type === 'json' ? object.json() : object.text();
      },
      put(key, value) {
        return bucket.put(key, value, { httpMetadata: { contentType: 'application/json' } });
      },
      async list({ prefix = '', cursor } = {}) {
        const page = await bucket.list({ prefix, cursor, limit: 1000 });
        return { keys: page.objects.map(({ key }) => ({ name: key })), list_complete: !page.truncated, cursor: page.cursor };
      },
    },
  };
}
