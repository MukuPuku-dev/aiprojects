(() => {
  const DEFAULT_DB_URL = "https://database-mukeshpokharel.aws-ap-south-1.turso.io";
  const DEFAULT_DB_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMwNzQyNTgsImlkIjoiMDFhMTdiOGQtNjgwMS03M2JjLTk4NmQtYjc1ZmQ2ZThlMjY0Iiwia2lkIjoiU3Vsa0Q4bWRVX1FSdkFLaFVubDEwM3Z0YUtGNldfT3lJdXdxU3RMeXFlayIsInJpZCI6IjAxMGZmMzYyLWNhZDAtNGFmNC1iMGViLWJjN2QzNmNmNjBjZCJ9._GaxGeLpcmAj006y_16nh-AvjNBsJbD5vZ0PvjmAMLimBBQopepFDi4Y4jW4H0aVN1ouPz7Ab1ksYoClDj6cCA";

  const cacheName = "story-studio-assets";
  const cacheVersion = 2;
  const PROGRESS_META_PREFIX = "studio_progress_meta_";
  const CHARACTER_CACHE_KEY = "studio_characters_cache_v1";
  let cacheOpen;
  let cacheWarningShown = false;
  let progressTableReady = null;
  let characterTableReady = null;
  let seedCharactersDone = null;

  function canUseRemoteCloud() {
    try {
      if (typeof navigator !== "undefined" && navigator.webdriver && !window.__ENABLE_CLOUD_SYNC_TEST__) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }

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

  async function executeCloudSql(statement, args = [], { url = DEFAULT_DB_URL, token = DEFAULT_DB_TOKEN, timeoutMs = 7000 } = {}) {
    if (!url || !token) throw new Error("Database URL and token are required.");
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
              {
                type: "execute",
                stmt: {
                  sql: statement,
                  args: args.map(value =>
                    value === null || value === undefined
                      ? { type: "null" }
                      : { type: typeof value === "number" ? "integer" : "text", value: String(value) }
                  )
                }
              },
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

  function createProjectStorage({ projectId, url = DEFAULT_DB_URL, token = DEFAULT_DB_TOKEN, timeoutMs = 7000 } = {}) {
    if (!projectId) throw new Error("Project storage requires a project ID.");
    const prefix = `${projectId}:`;
    const assetRequests = new Map();

    function sql(statement, args = []) {
      return executeCloudSql(statement, args, { url, token, timeoutMs });
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
      if (!dbKeys.length || !canUseRemoteCloud()) return { keys: available, error: null };
      try {
        const rows = await selectAssets(dbKeys, false);
        const found = new Map(rows.map(row => [row[0], +row[1]]));
        const staleCacheKeys = [];
        keys.forEach((key, index) => {
          const currentLength = found.get(databaseKey(key)) ?? found.get(legacyKeys[key]);
          if (currentLength === undefined) {
            if (!cached[index]) available.delete(key);
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
      if (!missing.length || !canUseRemoteCloud()) return { assets, error: null };

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
      await cacheWrite(cacheKey(key), data);
      if (!canUseRemoteCloud()) return;
      await sql("CREATE TABLE IF NOT EXISTS assets(key TEXT PRIMARY KEY,data TEXT)");
      await sql("INSERT INTO assets(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data", [databaseKey(key), data]);
    }

    async function saveAssetLocal(key, data) {
      if (!await cacheWrite(cacheKey(key), data)) throw new Error("Could not save the image in this browser's local storage.");
    }

    async function deleteAssets(keys, legacyKeys = {}) {
      await cacheDelete(keys.map(cacheKey));
      if (!canUseRemoteCloud()) return;
      const dbKeys = [...new Set(keys.flatMap(key => [databaseKey(key), legacyKeys[key]].filter(Boolean)))];
      if (dbKeys.length) {
        for (let index = 0; index < dbKeys.length; index += 200) {
          const batch = dbKeys.slice(index, index + 200);
          await sql(`DELETE FROM assets WHERE key IN (${batch.map(() => "?").join(",")})`, batch);
        }
      }
    }

    return { sql, listAssets, getAssets, saveAsset, saveAssetLocal, deleteAssets };
  }

  /* ---------- Cloud Progress Sync ---------- */
  function readLocalProgressMeta(projectId) {
    try {
      const raw = localStorage.getItem(PROGRESS_META_PREFIX + projectId);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeLocalProgressMeta(projectId, entry) {
    try {
      localStorage.setItem(PROGRESS_META_PREFIX + projectId, JSON.stringify(entry));
    } catch {}
  }

  function readAllLocalProgressMeta() {
    const map = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(PROGRESS_META_PREFIX)) continue;
        const pid = key.slice(PROGRESS_META_PREFIX.length);
        const parsed = readLocalProgressMeta(pid);
        if (parsed) map[pid] = parsed;
      }
    } catch {}
    return map;
  }

  function ensureProgressTable() {
    if (!canUseRemoteCloud()) return Promise.resolve();
    if (!progressTableReady) {
      progressTableReady = executeCloudSql(
        "CREATE TABLE IF NOT EXISTS project_progress(project_id TEXT PRIMARY KEY, total_clips INTEGER NOT NULL DEFAULT 0, completed_count INTEGER NOT NULL DEFAULT 0, checked_json TEXT NOT NULL DEFAULT '{}', state_json TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL DEFAULT 0)"
      ).catch(err => {
        progressTableReady = null;
        throw err;
      });
    }
    return progressTableReady;
  }

  function safeParseJson(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v && typeof v === "object" ? v : fallback;
    } catch {
      return fallback;
    }
  }

  async function saveProjectProgress(projectId, { totalClips = 0, completedCount = 0, checked = {}, state = {}, updatedAt } = {}) {
    if (!projectId) return { ok: false };
    const ts = typeof updatedAt === "number" ? updatedAt : Date.now();
    const entry = {
      projectId,
      totalClips: Number(totalClips) || 0,
      completedCount: Number(completedCount) || 0,
      checked: checked || {},
      state: state || {},
      updatedAt: ts
    };
    writeLocalProgressMeta(projectId, entry);
    if (!canUseRemoteCloud()) return { ok: true, localOnly: true, updatedAt: ts };
    try {
      await ensureProgressTable();
      await executeCloudSql(
        "INSERT INTO project_progress(project_id,total_clips,completed_count,checked_json,state_json,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET total_clips=excluded.total_clips,completed_count=excluded.completed_count,checked_json=excluded.checked_json,state_json=excluded.state_json,updated_at=excluded.updated_at",
        [
          projectId,
          entry.totalClips,
          entry.completedCount,
          JSON.stringify(entry.checked),
          JSON.stringify(entry.state),
          entry.updatedAt
        ]
      );
      return { ok: true, updatedAt: ts };
    } catch (error) {
      console.warn(`Could not sync progress for "${projectId}" to cloud:`, error);
      return { ok: false, error, updatedAt: ts };
    }
  }

  async function loadAllProjectProgress() {
    const map = readAllLocalProgressMeta();
    if (!canUseRemoteCloud()) return { progress: map, error: null };
    try {
      await ensureProgressTable();
      const rows = await executeCloudSql(
        "SELECT project_id, total_clips, completed_count, checked_json, state_json, updated_at FROM project_progress"
      );
      for (const row of rows) {
        const projectId = row[0];
        const remote = {
          projectId,
          totalClips: Number(row[1]) || 0,
          completedCount: Number(row[2]) || 0,
          checked: safeParseJson(row[3], {}),
          state: safeParseJson(row[4], {}),
          updatedAt: Number(row[5]) || 0
        };
        const local = map[projectId];
        if (!local || remote.updatedAt >= (local.updatedAt || 0)) {
          map[projectId] = remote;
          if (remote.updatedAt > 0 || remote.completedCount > 0) {
            writeLocalProgressMeta(projectId, remote);
          }
        }
      }
      return { progress: map, error: null };
    } catch (error) {
      console.warn("Could not load cloud project progress:", error);
      return { progress: map, error };
    }
  }

  async function syncWorkspaceProgress({ projectId, totalClips, readLocal, applyMerged }) {
    const local = readLocal();
    const localMeta = readLocalProgressMeta(projectId);
    const localUpdatedAt = Number(localMeta?.updatedAt) || 0;
    const localCompletedCount = Number(local.completedCount) || 0;

    if (!canUseRemoteCloud()) {
      return { source: "local", updatedAt: localUpdatedAt };
    }

    try {
      await ensureProgressTable();
      const rows = await executeCloudSql(
        "SELECT project_id, total_clips, completed_count, checked_json, state_json, updated_at FROM project_progress WHERE project_id=?",
        [projectId]
      );
      if (!rows.length) {
        if (local.hasLocal && localCompletedCount > 0) {
          await saveProjectProgress(projectId, {
            totalClips,
            completedCount: localCompletedCount,
            checked: local.checked,
            state: local.state
          });
        } else {
          await saveProjectProgress(projectId, {
            totalClips,
            completedCount: localCompletedCount,
            checked: local.checked,
            state: local.state,
            updatedAt: local.hasLocal ? Date.now() : 0
          });
        }
        return { source: "uploaded", updatedAt: Date.now() };
      }

      const row = rows[0];
      const remote = {
        projectId,
        totalClips: Number(row[1]) || totalClips,
        completedCount: Number(row[2]) || 0,
        checked: safeParseJson(row[3], {}),
        state: safeParseJson(row[4], {}),
        updatedAt: Number(row[5]) || 0
      };

      if (!local.hasLocal) {
        if (remote.updatedAt > 0 || remote.completedCount > 0) {
          applyMerged(remote.checked, remote.state);
          writeLocalProgressMeta(projectId, remote);
        }
        return { source: "remote", updatedAt: remote.updatedAt };
      }

      if (localUpdatedAt === 0) {
        if (remote.updatedAt === 0 && remote.completedCount === 0) {
          await saveProjectProgress(projectId, {
            totalClips,
            completedCount: localCompletedCount,
            checked: local.checked,
            state: local.state
          });
          return { source: "uploaded", updatedAt: Date.now() };
        }
        const mergedChecked = { ...remote.checked, ...local.checked };
        const mergedState = { ...remote.state, ...local.state };
        applyMerged(mergedChecked, mergedState);
        const mergedCount = Object.keys(mergedChecked).filter(k => mergedChecked[k]).length;
        const saved = await saveProjectProgress(projectId, {
          totalClips,
          completedCount: mergedCount,
          checked: mergedChecked,
          state: mergedState
        });
        return { source: "merged", updatedAt: saved.updatedAt };
      }

      if (remote.updatedAt > localUpdatedAt) {
        applyMerged(remote.checked, remote.state);
        writeLocalProgressMeta(projectId, remote);
        return { source: "remote", updatedAt: remote.updatedAt };
      }

      if (localUpdatedAt > remote.updatedAt) {
        await saveProjectProgress(projectId, {
          totalClips,
          completedCount: localCompletedCount,
          checked: local.checked,
          state: local.state,
          updatedAt: localUpdatedAt
        });
        return { source: "local-pushed", updatedAt: localUpdatedAt };
      }

      return { source: "synced", updatedAt: remote.updatedAt };
    } catch (error) {
      console.warn(`Could not sync workspace progress for "${projectId}":`, error);
      return { source: "offline", error };
    }
  }

  /* ---------- Cloud Character Vault ---------- */
  const DEFAULT_CHARACTERS = [
    // काम नलाग्ने कोही हुँदैन (11 characters)
    {
      id: "kam-nalagne:S",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "S",
      name: "Suman",
      role: "Lead protagonist (25)",
      appearance: "SUMAN (25): lean build, sun-weathered face, short black hair, pale-blue shirt, dark brown trousers, worn sandals, cloth shoulder bag. Quiet, observant, a little withdrawn; his confidence is low but his eyes notice everything about water and soil.",
      ref_prompt: "Character reference: full-body front three-quarter view of a lean 25-year-old Nepali man, sun-weathered face, short black hair, pale-blue shirt, dark brown trousers, worn sandals, cloth shoulder bag, quiet observant expression. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-S"
    },
    {
      id: "kam-nalagne:M",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "M",
      name: "Maya",
      role: "Suman's sister (19)",
      appearance: "MAYA (19): Suman's sister; long black braid, maroon kurta with a blue shawl; sharp, expressive, ambitious student, affectionate but sometimes exasperated with her brother.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 19-year-old Nepali woman, long black braid, maroon kurta and blue shawl, sharp expressive face. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-M"
    },
    {
      id: "kam-nalagne:R",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "R",
      name: "Ramesh",
      role: "Childhood friend (27)",
      appearance: "RAMESH (27): Suman's childhood friend; green jacket, black trousers; talkative, warm, teasing, with worry hidden behind jokes.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 27-year-old Nepali man, green jacket and black trousers, friendly teasing smile. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-R"
    },
    {
      id: "kam-nalagne:A",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "A",
      name: "Saraswati",
      role: "Mother (50)",
      appearance: "SARASWATI (50): mother of Suman and Maya; green blouse, dark red shawl, hardworking hands, tired caring eyes, always worried about money.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 50-year-old Nepali woman, green blouse and dark red shawl, hardworking hands, tired caring eyes. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-A"
    },
    {
      id: "kam-nalagne:B",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "B",
      name: "Bhimbahadur",
      role: "Ward chairman (52)",
      appearance: "BHIMBAHADUR (52): ward chairman; heavy build, moustache, Dhaka topi, brown coat over white daura-suruwal; proud and formal, defensive when wrong, but not a villain.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 52-year-old heavyset Nepali man with a moustache, Dhaka topi, brown coat over white daura-suruwal, proud expression. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-B"
    },
    {
      id: "kam-nalagne:K",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "K",
      name: "Kedar",
      role: "Local contractor (40s)",
      appearance: "KEDAR (40s): local contractor; dusty work shirt, cap, notebook in pocket; pressured by costs and deadlines, defensive, not cruel.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 40-year-old Nepali contractor, dusty work shirt, cap, notebook in pocket, defensive but tired. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-K"
    },
    {
      id: "kam-nalagne:D",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "D",
      name: "Dhaniram",
      role: "Elderly farmer (65)",
      appearance: "DHANIRAM (65): elderly farmer; weathered face, grey stubble, old topi, faded cotton clothes, a wooden walking stick; wise but sometimes stuck in old ways.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 65-year-old Nepali farmer, weathered face, grey stubble, old topi, faded cotton clothes, wooden stick. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-D"
    },
    {
      id: "kam-nalagne:U",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "U",
      name: "Sushila",
      role: "School teacher (30s)",
      appearance: "SUSHILA (30s): school teacher; neat sari, shawl, cardigan, spectacles; calm, fair-minded, believes in facts and in Maya.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 35-year-old Nepali schoolteacher, neat sari with cardigan, spectacles, calm face. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-U"
    },
    {
      id: "kam-nalagne:F",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "F",
      name: "Father (Suman's Father)",
      role: "Late father / Flashback (50s)",
      appearance: "SUMAN'S FATHER (late, seen in flashbacks, 50s): lean, grey-streaked hair, thin moustache, faded brown jacket with rolled sleeves, honest intense eyes, a worn notebook in his hand; truthful and stubborn, sometimes harsh when ignored.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 50-year-old Nepali man (Suman's late father), grey-streaked hair, thin moustache, faded brown jacket with rolled sleeves, honest intense eyes, holding a small notebook. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-F"
    },
    {
      id: "kam-nalagne:L",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "L",
      name: "Bishal",
      role: "Village boy (9)",
      appearance: "BISHAL (9): small, bright-eyed village boy, scruffy short hair, oversized faded school sweater and shorts, bare feet or rubber slippers; endlessly curious, asks the questions adults forget to ask.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 9-year-old Nepali village boy, scruffy short hair, oversized faded school sweater and shorts, bright curious eyes. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-L"
    },
    {
      id: "kam-nalagne:T",
      project_id: "kam-nalagne",
      project_name: "काम नलाग्ने कोही हुँदैन",
      code: "T",
      name: "Technician",
      role: "Municipality engineer (30s)",
      appearance: "TECHNICIAN (30s): municipality engineer; rain jacket, helmet, measuring tape and clipboard; careful, speaks only about what he can verify.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 30-year-old Nepali municipal engineer, rain jacket, helmet, clipboard and measuring tape. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-T"
    },
    // साधु र राडी (4 characters)
    {
      id: "sadhu-rani:G",
      project_id: "sadhu-rani",
      project_name: "साधु र राडी",
      code: "G",
      name: "Sadhu",
      role: "Wandering ascetic (60s)",
      appearance: "THE SADHU (60s): lean, calm ascetic with long grey matted hair tied up, long white-grey beard, ochre-saffron robe worn thin, rudraksha beads, a wooden staff and a brass water pot (kamandalu), a small cloth bundle, bare feet. Serene, gentle eyes; speaks softly; truly honest by nature.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 60-year-old Nepali sadhu, long grey matted hair tied up, long white-grey beard, thin ochre-saffron robe, rudraksha beads, wooden staff, brass water pot, small cloth bundle, bare feet, serene eyes. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-G"
    },
    {
      id: "sadhu-rani:H",
      project_id: "sadhu-rani",
      project_name: "साधु र राडी",
      code: "H",
      name: "Hari",
      role: "Village farmer (45)",
      appearance: "HARI (45): village farmer; sun-darkened skin, short hair, cotton daura-suruwal with a grey shawl, a Dhaka topi; warm and hospitable, but weak when tempted and quick to justify small wrongs.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 45-year-old Nepali village farmer, sun-darkened skin, short hair, cotton daura-suruwal with grey shawl and Dhaka topi, slightly guilty warm expression. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-H"
    },
    {
      id: "sadhu-rani:W",
      project_id: "sadhu-rani",
      project_name: "साधु र राडी",
      code: "W",
      name: "Devi",
      role: "Hari's wife (40)",
      appearance: "DEVI (40): Hari's wife; red-bordered cotton sari with a faded shawl, simple glass bangles, a pinch of worry always in her eyes; kind, honest, uneasy about her husband's habits.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 40-year-old Nepali village woman, red-bordered cotton sari with faded shawl, glass bangles, kind worried eyes. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-W"
    },
    {
      id: "sadhu-rani:N",
      project_id: "sadhu-rani",
      project_name: "साधु र राडी",
      code: "N",
      name: "Ramkaji",
      role: "Neighbouring farmer (50)",
      appearance: "RAMKAJI (50): Hari's neighbour and a hard-working farmer; stocky, moustache, brown vest over white shirt, a cloth wrapped around his head; blunt and short-tempered but fair at heart.",
      ref_prompt: "Character reference: full-body front three-quarter view of a 50-year-old stocky Nepali farmer with moustache, brown vest over white shirt, cloth wrapped around the head, blunt expression. Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text.",
      image_key: "char-N"
    },
    // Teenage Love Vibes (2 characters)
    {
      id: "teenage-love-vibes:AARAV",
      project_id: "teenage-love-vibes",
      project_name: "Teenage Love Vibes",
      code: "AARAV",
      name: "Aarav",
      role: "Teenage male lead (17)",
      appearance: "AARAV (17): Nepali teenage boy, lean build, soft tousled dark hair falling slightly over expressive warm brown eyes, faint dimple, silver wristwatch on his left wrist; wears a navy-blue college blazer over a crisp white shirt with loosened tie during school scenes, or an olive-green zip hoodie in weekend scenes.",
      ref_prompt: "Character reference: full-body front three-quarter portrait sheet of a 17-year-old Nepali teenage boy, lean build, soft tousled dark hair, expressive warm brown eyes, faint dimple, silver wristwatch on left wrist, wearing navy-blue college blazer over white shirt with loosened tie. Plain soft neutral background, natural daylight, photorealistic 35mm film aesthetic, no text.",
      image_key: "char-AARAV"
    },
    {
      id: "teenage-love-vibes:AANYA",
      project_id: "teenage-love-vibes",
      project_name: "Teenage Love Vibes",
      code: "AANYA",
      name: "Aanya",
      role: "Teenage female lead (17)",
      appearance: "AANYA (17): Nepali teenage girl, delicate expressive almond eyes, long wavy dark hair half-tied with a signature pale-pink silk ribbon, small silver jhumka earrings; wears a matching navy college blazer and pleated skirt in school scenes, or a soft cream knitted cardigan over a pastel kurta in weekend scenes.",
      ref_prompt: "Character reference: full-body front three-quarter portrait sheet of a 17-year-old Nepali teenage girl, delicate almond eyes, long wavy dark hair half-tied with a pale-pink silk ribbon, small silver jhumka earrings, wearing navy college blazer and pleated skirt. Plain soft neutral background, natural daylight, photorealistic 35mm film aesthetic, no text.",
      image_key: "char-AANYA"
    },
    // तरकारीको कथा (5 characters)
    {
      id: "tarkari-katha:ALU",
      project_id: "tarkari-katha",
      project_name: "तरकारीको कथा",
      code: "ALU",
      name: "Aalu",
      role: "Potato protagonist",
      appearance: "AALU (Potato, 20s): Plump, endearing Pahadi brown potato with textured soil-flecked matte skin, two tiny bright-green sprout leaves on top of his head like messy hair, big soulful warm-brown eyes, stubby root hands and feet, and a tiny crisscross bandage on his left cheek. Humble, self-conscious about being round and 'ordinary', but fiercely loyal.",
      ref_prompt: "Character reference: full-body 3D macro Pixar-style character turnaround sheet of AALU (Potato, 20s): Plump, endearing Pahadi brown potato with textured soil-flecked matte skin, two tiny bright-green sprout leaves on top of his head like messy hair, big soulful warm-brown eyes, stubby root hands and feet, and a tiny crisscross bandage on his left cheek. Plain soft neutral studio background, natural macro rim lighting, ultra-detailed tactile vegetable skin texture, expressive eyes, no text.",
      image_key: "char-ALU"
    },
    {
      id: "tarkari-katha:GOLBHEDA",
      project_id: "tarkari-katha",
      project_name: "तरकारीको कथा",
      code: "GOLBHEDA",
      name: "Golbheda",
      role: "Tomato co-lead",
      appearance: "GOLBHEDA (Tomato, 20s): Glossy, plump ruby-red tomato with translucent dewy skin, a jaunty five-pointed green calyx stem worn like a French beret on her head, big expressive sparkling eyes with long lashes, and tiny vine-tendril hands. Dramatic, perfectionist diva terrified of getting squished or wrinkled, with a secretly tender heart.",
      ref_prompt: "Character reference: full-body 3D macro Pixar-style character turnaround sheet of GOLBHEDA (Tomato, 20s): Glossy, plump ruby-red tomato with translucent dewy skin, a jaunty five-pointed green calyx stem worn like a French beret on her head, big expressive sparkling eyes with long lashes, and tiny vine-tendril hands. Plain soft neutral studio background, natural macro rim lighting, ultra-detailed tactile vegetable skin texture, expressive eyes, no text.",
      image_key: "char-GOLBHEDA"
    },
    {
      id: "tarkari-katha:PYAAJ",
      project_id: "tarkari-katha",
      project_name: "तरकारीको कथा",
      code: "PYAAJ",
      name: "Pyaaj",
      role: "Onion poet",
      appearance: "PYAAJ (Onion, 30s): Round purple-pink onion wearing a slightly peeling papery outer tunic, a neat pointed dry-stem top-knot, tiny round wire-rim spectacles perched on his nose, and watery empathetic eyes. Gentle poet who accidentally makes everyone cry whenever he gets emotional or peels a layer.",
      ref_prompt: "Character reference: full-body 3D macro Pixar-style character turnaround sheet of PYAAJ (Onion, 30s): Round purple-pink onion wearing a slightly peeling papery outer tunic, a neat pointed dry-stem top-knot, tiny round wire-rim spectacles perched on his nose, and watery empathetic eyes. Plain soft neutral studio background, natural macro rim lighting, ultra-detailed tactile vegetable skin texture, expressive eyes, no text.",
      image_key: "char-PYAAJ"
    },
    {
      id: "tarkari-katha:KHURSANI",
      project_id: "tarkari-katha",
      project_name: "तरकारीको कथा",
      code: "KHURSANI",
      name: "Khursani",
      role: "Green Chili protector",
      appearance: "KHURSANI (Chili, teen): Sleek, curved, glossy emerald-green Nepali Akabare/hariyo chili pepper with a curved green stem ponytail, sharp determined eyebrows, and tiny puffs of white steam whistling from his ears when angry. Short-tempered, fearless protector.",
      ref_prompt: "Character reference: full-body 3D macro Pixar-style character turnaround sheet of KHURSANI (Chili, teen): Sleek, curved, glossy emerald-green Nepali Akabare/hariyo chili pepper with a curved green stem ponytail, sharp determined eyebrows, and tiny puffs of white steam whistling from his ears when angry. Plain soft neutral studio background, natural macro rim lighting, ultra-detailed tactile vegetable skin texture, expressive eyes, no text.",
      image_key: "char-KHURSANI"
    },
    {
      id: "tarkari-katha:LASUN",
      project_id: "tarkari-katha",
      project_name: "तरकारीको कथा",
      code: "LASUN",
      name: "Lasun",
      role: "Wise Garlic elder",
      appearance: "LASUN (Garlic Baaje, 60s): Weathered ivory-white garlic bulb elder with a wispy dried-root white beard, kind crinkled eyes, papery shawl layers, holding a tiny cinnamon-stick walking staff. Calm, philosophical mentor.",
      ref_prompt: "Character reference: full-body 3D macro Pixar-style character turnaround sheet of LASUN (Garlic Baaje, 60s): Weathered ivory-white garlic bulb elder with a wispy dried-root white beard, kind crinkled eyes, papery shawl layers, holding a tiny cinnamon-stick walking staff. Plain soft neutral studio background, natural macro rim lighting, ultra-detailed tactile vegetable skin texture, expressive eyes, no text.",
      image_key: "char-LASUN"
    },
    // The Last Lantern (4 stickman characters)
    {
      id: "stickman-lantern:KIRAN",
      project_id: "stickman-lantern",
      project_name: "The Last Lantern",
      code: "KIRAN",
      name: "Kiran",
      role: "Stickman hero",
      appearance: "KIRAN (Main Stickman Hero): Classic 2D stickman cartoon character with clean bold ink-black line art, expressive white circular eyes with dynamic pupils and brow lines, slender proportions, wearing a flowing bright crimson-red scarf trailing behind his neck and carrying a small vintage brass oil lantern glowing warm golden-amber in his right hand.",
      ref_prompt: "Character reference: clean full-body 2D stickman cartoon turnaround character sheet of KIRAN (Main Stickman Hero): Classic 2D stickman cartoon character with clean bold ink-black line art, expressive white circular eyes with dynamic pupils and brow lines, slender proportions, wearing a flowing bright crimson-red scarf trailing behind his neck and carrying a small vintage brass oil lantern glowing warm golden-amber in his right hand. Plain clean white/light neutral background for easy referencing, ultra-sharp black ink outlines, clear silhouette, expression range chart, no text.",
      image_key: "char-KIRAN"
    },
    {
      id: "stickman-lantern:PIP",
      project_id: "stickman-lantern",
      project_name: "The Last Lantern",
      code: "PIP",
      name: "Pip",
      role: "Young stickman companion",
      appearance: "PIP (Small Stickman Companion): Smaller, younger 2D stickman cartoon character with clean ink-black line art, big curious expressive eyes, wearing an oversized pale sky-blue hooded tunic and carrying a tiny carved wooden flute tied to a waist string.",
      ref_prompt: "Character reference: clean full-body 2D stickman cartoon turnaround character sheet of PIP (Small Stickman Companion): Smaller, younger 2D stickman cartoon character with clean ink-black line art, big curious expressive eyes, wearing an oversized pale sky-blue hooded tunic and carrying a tiny carved wooden flute tied to a waist string. Plain clean white/light neutral background for easy referencing, ultra-sharp black ink outlines, clear silhouette, expression range chart, no text.",
      image_key: "char-PIP"
    },
    {
      id: "stickman-lantern:OWL",
      project_id: "stickman-lantern",
      project_name: "The Last Lantern",
      code: "OWL",
      name: "Clockwork Owl",
      role: "Mechanical brass owl",
      appearance: "CLOCKWORK OWL (Mechanical Companion): Small stylized 2D cartoon brass-and-ink mechanical owl with clean dark outlines, glowing warm-gold circular lens eyes, and delicate hinged brass wing feathers that click open.",
      ref_prompt: "Character reference: clean full-body 2D stickman cartoon turnaround character sheet of CLOCKWORK OWL (Mechanical Companion): Small stylized 2D cartoon brass-and-ink mechanical owl with clean dark outlines, glowing warm-gold circular lens eyes, and delicate hinged brass wing feathers that click open. Plain clean white/light neutral background for easy referencing, ultra-sharp black ink outlines, clear silhouette, expression range chart, no text.",
      image_key: "char-OWL"
    },
    {
      id: "stickman-lantern:SHADOW_KING",
      project_id: "stickman-lantern",
      project_name: "The Last Lantern",
      code: "SHADOW_KING",
      name: "Shadow King",
      role: "Ink-silhouette antagonist",
      appearance: "SHADOW KING (Antagonist): Towering colossal 2D ink-silhouette stickman entity twice the height of normal stickmen, jagged smoky cloak edges, crown-like twin ink horns, and menacing glowing violet eyes.",
      ref_prompt: "Character reference: clean full-body 2D stickman cartoon turnaround character sheet of SHADOW KING (Antagonist): Towering colossal 2D ink-silhouette stickman entity twice the height of normal stickmen, jagged smoky cloak edges, crown-like twin ink horns, and menacing glowing violet eyes. Plain clean white/light neutral background for easy referencing, ultra-sharp black ink outlines, clear silhouette, expression range chart, no text.",
      image_key: "char-SHADOW_KING"
    },
    // PurpleStick (Viral 2D Stickman Comedy Reels cast)
    {
      id: "purplestick:PURP_GUY",
      project_id: "purplestick",
      project_name: "PurpleStick",
      code: "PURP_GUY",
      name: "PurpleStick Guy",
      role: "Lead Husband / Comedy Guy",
      appearance: "PURP_GUY (PurpleStick Guy / Husband): Clean 2D vector cartoon stickman with a large perfectly round vibrant royal-purple (#8B3DFF) head, small cute spiky purple hair tuft on top, thick crisp black outlines, huge expressive white cartoon eyes with dynamic black pupils and eyebrows, animated lip-syncing mouth, and a thin solid black stickman body, arms, legs, and flat black oval feet.",
      ref_prompt: "Character reference: clean full-body 2D vector cartoon stickman turnaround sheet of PURP_GUY (PurpleStick Guy): large perfectly round vibrant royal-purple (#8B3DFF) head with small spiky hair tuft, thick crisp black outlines, huge expressive white eyes showing smug, shocked, happy, and dizzy expressions, thin black stickman body. Plain clean white background, no text.",
      image_key: "char-PURP_GUY"
    },
    {
      id: "purplestick:PURP_GIRL",
      project_id: "purplestick",
      project_name: "PurpleStick",
      code: "PURP_GIRL",
      name: "PurpleStick Girl",
      role: "Lead Wife / Sassy Girlfriend",
      appearance: "PURP_GIRL (PurpleStick Girl / Wife): Clean 2D vector cartoon stickman with a large perfectly round vibrant royal-purple (#8B3DFF) head, sleek dark-brown/black cartoon ponytail, cute curved eyelashes, glossy red-pink cartoon lips, huge expressive white eyes, thick crisp black outlines, and a thin solid black stickman body.",
      ref_prompt: "Character reference: clean full-body 2D vector cartoon stickman turnaround sheet of PURP_GIRL (PurpleStick Girl): large perfectly round vibrant royal-purple (#8B3DFF) head with sleek dark ponytail, cute eyelashes, glossy lips, thick crisp black outlines, huge expressive white eyes showing sassy, starry-eyed, shocked, and furious expressions, thin black stickman body. Plain clean white background, no text.",
      image_key: "char-PURP_GIRL"
    },
    {
      id: "purplestick:PURP_TEACHER",
      project_id: "purplestick",
      project_name: "PurpleStick",
      code: "PURP_TEACHER",
      name: "PurpleStick Teacher/Boss",
      role: "Strict Teacher / Office Boss",
      appearance: "PURP_TEACHER (PurpleStick Teacher / Boss): Clean 2D vector cartoon stickman with a large round vibrant royal-purple (#8B3DFF) head, expressive furrowed eyebrows and big cartoon eyes, wearing a neat white collared dress shirt with a dark charcoal necktie over a thin black stickman body and legs, thick crisp black outlines.",
      ref_prompt: "Character reference: clean full-body 2D vector cartoon stickman turnaround sheet of PURP_TEACHER: large round vibrant royal-purple (#8B3DFF) head, wearing a neat white dress shirt and dark tie over a thin black stickman body, thick crisp black outlines, expressive strict and furious cartoon expressions. Plain clean white background, no text.",
      image_key: "char-PURP_TEACHER"
    },
    {
      id: "purplestick:WHITE_KID",
      project_id: "purplestick",
      project_name: "PurpleStick",
      code: "WHITE_KID",
      name: "Cheeky Student",
      role: "Smart-Aleck Student Foil",
      appearance: "WHITE_KID (Cheeky Student / Friend): Clean 2D vector cartoon stickman with a slightly smaller round pure-white head, smug half-lidded expressive cartoon eyes, cheeky smirk, thick crisp black outlines, and a thin solid black stickman body and limbs.",
      ref_prompt: "Character reference: clean full-body 2D vector cartoon stickman turnaround sheet of WHITE_KID: round pure-white head with smug half-lidded cartoon eyes and cheeky smirk, thick crisp black outlines, thin solid black stickman body. Plain clean white background, no text.",
      image_key: "char-WHITE_KID"
    }
  ];

  function readCachedCharacters() {
    try {
      const raw = localStorage.getItem(CHARACTER_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {}
    return DEFAULT_CHARACTERS.map(c => ({ ...c, updated_at: 0 }));
  }

  function writeCachedCharacters(list) {
    try {
      localStorage.setItem(CHARACTER_CACHE_KEY, JSON.stringify(list));
    } catch {}
  }

  function ensureCharactersTable() {
    if (!canUseRemoteCloud()) return Promise.resolve();
    if (!characterTableReady) {
      characterTableReady = executeCloudSql(
        "CREATE TABLE IF NOT EXISTS characters(id TEXT PRIMARY KEY, project_id TEXT NOT NULL, project_name TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, role TEXT DEFAULT '', appearance TEXT NOT NULL, ref_prompt TEXT NOT NULL, image_key TEXT DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0)"
      ).catch(err => {
        characterTableReady = null;
        throw err;
      });
    }
    return characterTableReady;
  }

  async function seedDefaultCharacters(extraCharacters = []) {
    const items = extraCharacters.length ? extraCharacters : DEFAULT_CHARACTERS;
    if (!canUseRemoteCloud()) return readCachedCharacters();
    if (!seedCharactersDone || extraCharacters.length) {
      const run = (async () => {
        await ensureCharactersTable();
        const existingRows = await executeCloudSql("SELECT id FROM characters");
        const existing = new Set(existingRows.map(r => r[0]));
        const missing = items.filter(c => !existing.has(c.id));
        const now = Date.now();
        for (const c of missing) {
          await executeCloudSql(
            "INSERT INTO characters(id,project_id,project_name,code,name,role,appearance,ref_prompt,image_key,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
            [c.id, c.project_id, c.project_name, c.code, c.name, c.role || "", c.appearance, c.ref_prompt, c.image_key || ("char-" + c.code), now]
          );
        }
      })().catch(err => {
        if (!extraCharacters.length) seedCharactersDone = null;
        console.warn("Could not seed default characters to cloud:", err);
      });
      if (!extraCharacters.length) seedCharactersDone = run;
      await run;
    } else {
      await seedCharactersDone;
    }
    return listCharacters();
  }

  async function listCharacters(projectId = "") {
    let list = readCachedCharacters();
    if (canUseRemoteCloud()) {
      try {
        await ensureCharactersTable();
        const existingRows = await executeCloudSql(
          "SELECT id, project_id, project_name, code, name, role, appearance, ref_prompt, image_key, updated_at FROM characters ORDER BY project_name ASC, name ASC"
        );
        if (!existingRows.length && !projectId) {
          await seedDefaultCharacters();
          return listCharacters(projectId);
        }
        const remote = existingRows.map(r => ({
          id: r[0],
          project_id: r[1],
          project_name: r[2],
          code: r[3],
          name: r[4],
          role: r[5] || "",
          appearance: r[6],
          ref_prompt: r[7],
          image_key: r[8] || ("char-" + r[3]),
          updated_at: Number(r[9]) || 0
        }));
        if (remote.length) {
          list = remote;
          writeCachedCharacters(list);
        }
      } catch (error) {
        console.warn("Could not load saved characters from cloud:", error);
      }
    }
    return projectId ? list.filter(c => c.project_id === projectId) : list;
  }

  async function saveCharacter(character) {
    const projectId = (character.project_id || "custom-series").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "custom-series";
    const code = (character.code || character.name || "CHAR").trim().replace(/\s+/g, "_").toUpperCase();
    const id = character.id || `${projectId}:${code}`;
    const name = (character.name || code).trim();
    const appearance = (character.appearance || "").trim();
    const refPrompt = (character.ref_prompt || "").trim() ||
      `Character reference: full-body front three-quarter view of ${appearance || name}. Plain pale background, entire body visible, natural light, photorealistic, consistent outfit and facial features, no text.`;
    const entry = {
      id,
      project_id: projectId,
      project_name: (character.project_name || projectId).trim(),
      code,
      name,
      role: (character.role || "").trim(),
      appearance: appearance || name,
      ref_prompt: refPrompt,
      image_key: character.image_key || ("char-" + code),
      updated_at: Date.now()
    };

    const cached = readCachedCharacters().filter(c => c.id !== entry.id);
    cached.push(entry);
    writeCachedCharacters(cached);

    if (canUseRemoteCloud()) {
      await ensureCharactersTable();
      await executeCloudSql(
        "INSERT INTO characters(id,project_id,project_name,code,name,role,appearance,ref_prompt,image_key,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET project_id=excluded.project_id,project_name=excluded.project_name,code=excluded.code,name=excluded.name,role=excluded.role,appearance=excluded.appearance,ref_prompt=excluded.ref_prompt,image_key=excluded.image_key,updated_at=excluded.updated_at",
        [entry.id, entry.project_id, entry.project_name, entry.code, entry.name, entry.role, entry.appearance, entry.ref_prompt, entry.image_key, entry.updated_at]
      );
    }
    return entry;
  }

  async function deleteCharacter(id) {
    const cached = readCachedCharacters().filter(c => c.id !== id);
    writeCachedCharacters(cached);
    if (canUseRemoteCloud()) {
      await ensureCharactersTable();
      await executeCloudSql("DELETE FROM characters WHERE id=?", [id]);
    }
  }

  window.StoryStudioStorage = {
    DEFAULT_DB_URL,
    DEFAULT_CHARACTERS,
    canUseRemoteCloud,
    createProjectStorage,
    saveProjectProgress,
    loadAllProjectProgress,
    syncWorkspaceProgress,
    seedDefaultCharacters,
    listCharacters,
    saveCharacter,
    deleteCharacter
  };
})();
