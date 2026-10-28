(() => {
  const cacheName = "story-studio-assets";
  const cacheVersion = 2;
  let cacheOpen;
  let cacheWarningShown = false;

  function openCache() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable"));
    if (!cacheOpen) {
      cacheOpen = new Promise((resolve, reject) => {
        const request = indexedDB.open(cacheName, cacheVersion);
        request.onupgradeneeded = event => {
          const db = request.result;
          if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets");
          if (!db.objectStoreNames.contains("meta")) {
            const meta = db.createObjectStore("meta");
            if (event.oldVersion > 0) {
              const cursorRequest = request.transaction.objectStore("assets").openCursor();
              cursorRequest.onsuccess = () => {
                const cursor = cursorRequest.result;
                if (!cursor) return;
                if (typeof cursor.value === "string") meta.put(cursor.value.length, cursor.key);
                cursor.continue();
              };
            }
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open the local image cache"));
      }).catch(error => {
        cacheOpen = null;
        throw error;
      });
    }
    return cacheOpen;
  }

  function warnCache(error) {
    if (cacheWarningShown) return;
    cacheWarningShown = true;
    console.warn("Story Studio local image cache is unavailable:", error);
  }

  async function cacheReadMany(keys) {
    if (!keys.length) return [];
    try {
      const db = await openCache();
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction("assets", "readonly");
        const store = transaction.objectStore("assets");
        const values = Array(keys.length).fill(null);
        keys.forEach((key, index) => {
          const request = store.get(key);
          request.onsuccess = () => { values[index] = request.result ?? null; };
          request.onerror = () => reject(request.error || new Error("Could not read the local image cache"));
        });
        transaction.oncomplete = () => resolve(values);
        transaction.onerror = () => reject(transaction.error || new Error("Could not read the local image cache"));
      });
    } catch (error) {
      warnCache(error);
      return Array(keys.length).fill(null);
    }
  }

  async function cacheHasMany(keys) {
    if (!keys.length) return [];
    try {
      const db = await openCache();
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction("assets", "readonly");
        const store = transaction.objectStore("assets");
        const found = Array(keys.length).fill(false);
        keys.forEach((key, index) => {
          const request = store.getKey(key);
          request.onsuccess = () => { found[index] = request.result !== undefined; };
          request.onerror = () => reject(request.error || new Error("Could not check the local image cache"));
        });
        transaction.oncomplete = () => resolve(found);
        transaction.onerror = () => reject(transaction.error || new Error("Could not check the local image cache"));
      });
    } catch (error) {
      warnCache(error);
      return Array(keys.length).fill(false);
    }
  }

  async function cacheLengths(keys) {
    if (!keys.length) return [];
    try {
      const db = await openCache();
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction("meta", "readonly");
        const store = transaction.objectStore("meta");
        const lengths = Array(keys.length).fill(null);
        keys.forEach((key, index) => {
          const request = store.get(key);
          request.onsuccess = () => { lengths[index] = request.result ?? null; };
          request.onerror = () => reject(request.error || new Error("Could not check local image versions"));
        });
        transaction.oncomplete = () => resolve(lengths);
        transaction.onerror = () => reject(transaction.error || new Error("Could not check local image versions"));
      });
    } catch (error) {
      warnCache(error);
      return Array(keys.length).fill(null);
    }
  }

  async function cacheWriteMany(entries) {
    if (!entries.length) return true;
    try {
      const db = await openCache();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(["assets", "meta"], "readwrite");
        const store = transaction.objectStore("assets");
        const meta = transaction.objectStore("meta");
        entries.forEach(([key, value]) => {
          store.put(value, key);
          meta.put(value.length, key);
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error("Could not update the local image cache"));
      });
      return true;
    } catch (error) {
      warnCache(error);
      return false;
    }
  }

  async function cacheWrite(key, value) {
    return cacheWriteMany([[key, value]]);
  }

  async function cacheDelete(keys) {
    if (!keys.length) return;
    try {
      const db = await openCache();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(["assets", "meta"], "readwrite");
        const store = transaction.objectStore("assets");
        const meta = transaction.objectStore("meta");
        keys.forEach(key => store.delete(key));
        keys.forEach(key => meta.delete(key));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error("Could not clear the local image cache"));
      });
    } catch (error) {
      warnCache(error);
    }
  }

  function createProjectStorage({ projectId, url, token, timeoutMs = 7000 }) {
    if (!projectId || !url || !token) throw new Error("Project storage requires a project ID, database URL, and token.");
    const prefix = `${projectId}:`;
    const assetRequests = new Map();

    async function sql(statement, args = []) {
      const isRead = /^\s*(SELECT|PRAGMA)\b/i.test(statement);
      const attempts = isRead ? 2 : 1;
      let lastError;

      for (let attempt = 0; attempt < attempts; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetch(url + "/v2/pipeline", {
            method: "POST",
            headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
            body: JSON.stringify({
              requests: [
                { type: "execute", stmt: { sql: statement, args: args.map(value => value === null ? { type: "null" } : { type: typeof value === "number" ? "integer" : "text", value: String(value) }) } },
                { type: "close" }
              ]
            }),
            signal: controller.signal
          });
          if (!response.ok) {
            const error = new Error(`Database request failed (${response.status}).`);
            error.status = response.status;
            throw error;
          }
          const payload = await response.json();
          const result = payload.results && payload.results[0];
          if (!result) throw new Error("Database returned an empty response.");
          if (result.type === "error") throw new Error(result.error.message);
          return (result.response.result.rows || []).map(row => row.map(column => column.value));
        } catch (error) {
          lastError = error.name === "AbortError" ? new Error(`Database request timed out after ${timeoutMs} ms.`) : error;
          const retryable = isRead && attempt + 1 < attempts && (!error.status || error.status === 408 || error.status === 429 || error.status >= 500);
          if (!retryable) throw lastError;
          await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
        } finally {
          clearTimeout(timeout);
        }
      }

      throw lastError;
    }

    function databaseKey(key) {
      return prefix + key;
    }

    function cacheKey(key) {
      return `${projectId}:${key}`;
    }

    async function selectAssets(keys, includeData) {
      const rows = [];
      for (let index = 0; index < keys.length; index += 200) {
        const batch = keys.slice(index, index + 200);
        const columns = includeData ? "key,data" : "key,length(data)";
        rows.push(...await sql(`SELECT ${columns} FROM assets WHERE key IN (${batch.map(() => "?").join(",")})`, batch));
      }
      return rows;
    }

    async function listAssets(keys, legacyKeys = {}) {
      const available = new Set();
      const cached = await cacheHasMany(keys.map(cacheKey));
      cached.forEach((found, index) => { if (found) available.add(keys[index]); });
      const cachedLengths = await cacheLengths(keys.map(cacheKey));

      const dbKeys = [...new Set(keys.flatMap(key => [databaseKey(key), legacyKeys[key]].filter(Boolean)))];
      if (!dbKeys.length) return { keys: available, error: null };
      try {
        const rows = await selectAssets(dbKeys, false);
        const found = new Map(rows.map(row => [row[0], +row[1]]));
        const staleCacheKeys = [];
        keys.forEach((key, index) => {
          const currentLength = found.get(databaseKey(key)) ?? found.get(legacyKeys[key]);
          if (currentLength === undefined) {
            available.delete(key);
            if (cached[index]) staleCacheKeys.push(cacheKey(key));
            return;
          }
          if (cached[index] && cachedLengths[index] !== null && cachedLengths[index] !== currentLength) {
            available.delete(key);
            staleCacheKeys.push(cacheKey(key));
            return;
          }
          available.add(key);
        });
        await cacheDelete(staleCacheKeys);
        return { keys: available, error: null };
      } catch (error) {
        console.warn(`Could not check saved images for project "${projectId}":`, error);
        return { keys: available, error };
      }
    }

    async function getAssets(keys, legacyKeys = {}) {
      const assets = {};
      const cached = (await cacheReadMany(keys.map(cacheKey))).map((value, index) => [keys[index], value]);
      const missing = [];
      cached.forEach(([key, value]) => {
        if (value === null) missing.push(key);
        else assets[key] = value;
      });
      if (!missing.length) return { assets, error: null };

      const toFetch = missing.filter(key => !assetRequests.has(key));
      if (toFetch.length) {
        let batch;
        batch = (async () => {
          const dbKeys = [...new Set(toFetch.flatMap(key => [databaseKey(key), legacyKeys[key]].filter(Boolean)))];
          const loaded = {};
          try {
            const rows = await selectAssets(dbKeys, true);
            const values = new Map(rows.map(row => [row[0], row[1]]));
            const cacheEntries = [];
            for (const key of toFetch) {
              const value = values.get(databaseKey(key)) ?? values.get(legacyKeys[key]);
              if (typeof value !== "string" || !value) continue;
              loaded[key] = value;
              cacheEntries.push([cacheKey(key), value]);
            }
            await cacheWriteMany(cacheEntries);
            return { assets: loaded, error: null };
          } catch (error) {
            console.warn(`Could not load saved images for project "${projectId}":`, error);
            return { assets: loaded, error };
          } finally {
            toFetch.forEach(key => { if (assetRequests.get(key) === batch) assetRequests.delete(key); });
          }
        })();
        toFetch.forEach(key => assetRequests.set(key, batch));
      }
      const pending = [...new Set(missing.map(key => assetRequests.get(key)).filter(Boolean))];
      const outcomes = await Promise.all(pending);
      let error = null;
      outcomes.forEach(outcome => {
        Object.assign(assets, outcome.assets);
        error = error || outcome.error;
      });
      return { assets, error };
    }

    async function saveAsset(key, data) {
      await sql("INSERT INTO assets(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data", [databaseKey(key), data]);
      await cacheWrite(cacheKey(key), data);
    }

    async function saveAssetLocal(key, data) {
      if (!await cacheWrite(cacheKey(key), data)) throw new Error("Could not save the image in this browser's local storage.");
    }

    async function deleteAssets(keys, legacyKeys = {}) {
      const dbKeys = [...new Set(keys.flatMap(key => [databaseKey(key), legacyKeys[key]].filter(Boolean)))];
      if (dbKeys.length) {
        for (let index = 0; index < dbKeys.length; index += 200) {
          const batch = dbKeys.slice(index, index + 200);
          await sql(`DELETE FROM assets WHERE key IN (${batch.map(() => "?").join(",")})`, batch);
        }
      }
      await cacheDelete(keys.map(cacheKey));
    }

    return { sql, listAssets, getAssets, saveAsset, saveAssetLocal, deleteAssets };
  }

  window.StoryStudioStorage = { createProjectStorage };
})();
