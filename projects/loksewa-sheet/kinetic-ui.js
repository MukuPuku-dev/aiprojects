(() => {
  const KINETIC_STORAGE_KEY = 'loksewa_kinetic_scripts_v1';
  const $ = id => document.getElementById(id);

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  let scripts = loadScripts();
  let activeId = scripts[0]?.id || 'kinetic-nepal-5';
  let imgMap = new Map();
  let uploadTargetFile = null;
  let pasteTargetIdx = null;
  let activeJobId = null;
  let pollTimer = null;

  function loadScripts() {
    const defaults = clone(window.KINETIC_SAMPLE_SCRIPTS || []);
    try {
      const raw = localStorage.getItem(KINETIC_STORAGE_KEY);
      if (!raw) return defaults;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.length) return defaults;
      const byId = new Map(saved.map(s => [s.id, s]));
      for (const d of defaults) if (!byId.has(d.id)) saved.push(d);
      return saved;
    } catch { return defaults; }
  }

  function persistScripts() {
    try { localStorage.setItem(KINETIC_STORAGE_KEY, JSON.stringify(scripts)); } catch {}
  }

  function getActive() {
    return scripts.find(s => s.id === activeId) || scripts[0];
  }

  function slideFile(idx) {
    return `slide_${String(idx + 1).padStart(2, '0')}.jpg`;
  }

  function blobToJpegDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const readRaw = () => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image data'));
        reader.readAsDataURL(blob);
      };
      if (blob.type === 'image/jpeg') {
        readRaw();
        return;
      }
      const objUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#0c0c10';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          URL.revokeObjectURL(objUrl);
          resolve(dataUrl);
        } catch {
          URL.revokeObjectURL(objUrl);
          readRaw();
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        readRaw();
      };
      img.src = objUrl;
    });
  }

  async function uploadSlideImageBlob(idx, blob, label = 'Uploaded') {
    const s = getActive();
    if (!s || !blob) return;
    const fname = slideFile(idx);
    $('kinStatus').textContent = `⏳ Saving photo for Slide ${idx + 1}...`;
    try {
      const dataUrl = await blobToJpegDataUrl(blob);
      const r = await fetch('/api/loksewa/upload-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId: s.id, filename: fname, dataUrl })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Upload failed');
      pasteTargetIdx = null;
      $('kinStatus').textContent = `✅ ${label} photo for Slide ${idx + 1} (${fname}).`;
      await refreshImages();
    } catch (err) {
      $('kinStatus').textContent = `❌ Photo save failed: ${err.message}`;
    }
  }

  function extractImageFromDataTransfer(dt) {
    if (!dt) return null;
    if (dt.files && dt.files.length) {
      for (const f of dt.files) {
        if (f && f.type && f.type.startsWith('image/')) return f;
      }
    }
    if (dt.items && dt.items.length) {
      for (const item of dt.items) {
        if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) return f;
        }
      }
    }
    return null;
  }

  function armSlideForPaste(idx) {
    pasteTargetIdx = idx;
    const list = $('kinSlideList');
    if (!list) return;
    list.querySelectorAll('.img-frame.paste-ready').forEach(el => el.classList.remove('paste-ready'));
    const frame = list.querySelector(`.q-card[data-slide-idx="${idx}"] .img-frame`);
    if (frame) {
      frame.classList.add('paste-ready');
      frame.focus();
    }
    $('kinStatus').textContent = `📋 Slide ${idx + 1} ready — press Ctrl+V now to paste a photo.`;
  }

  async function pasteFromClipboardForSlide(idx) {
    if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const preferred = ['image/png', 'image/jpeg', 'image/webp'];
          const imgType = preferred.find(t => item.types.includes(t))
            || item.types.find(t => t.startsWith('image/') && t !== 'image/svg+xml');
          if (imgType) {
            const blob = await item.getType(imgType);
            await uploadSlideImageBlob(idx, blob, 'Pasted');
            return;
          }
        }
        $('kinStatus').textContent = '⚠️ No photo found in clipboard. Copy an image or take a screenshot first, then click Paste or press Ctrl+V.';
        return;
      } catch {
        // Permission denied or clipboard.read() blocked in this context — fall back to Ctrl+V
      }
    }
    armSlideForPaste(idx);
  }

  function renderTabs() {
    const wrap = $('kinScriptTabs');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (const s of scripts) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `set-tab ${s.id === activeId ? 'active' : ''}`;
      const lc = s.lang === 'English' ? 'en' : (s.lang === 'Nepali' ? 'ne' : 'custom');
      btn.innerHTML = `
        <div class="set-tab-top">
          <span class="lang-tag ${lc}">${esc(s.lang || 'Custom')}</span>
          <small>${s.slides.length} slides</small>
        </div>
        <strong>${esc(s.name)}</strong>
        <small>${esc(s.title || '')}</small>
      `;
      btn.addEventListener('click', () => selectScript(s.id));
      wrap.appendChild(btn);
    }
  }

  function syncMeta() {
    const s = getActive();
    if (!s) return;
    $('kinTitle').value = s.title || '';
    $('kinHook').value = s.hook || '';
    $('kinOutro').value = s.outro || '';
    $('kinTheme').value = s.theme || 'random';
    $('kinVoice').value = s.voice || 'Kore';
  }

  function renderSlides() {
    const s = getActive();
    const list = $('kinSlideList');
    if (!s || !list) return;
    list.innerHTML = '';

    s.slides.forEach((sl, idx) => {
      const fname = slideFile(idx);
      const saved = imgMap.get(fname);
      const card = document.createElement('div');
      card.className = `q-card ${saved ? 'has-img' : ''}`;
      card.dataset.slideIdx = String(idx);

      const left = document.createElement('div');
      left.innerHTML = `
        <div class="q-head">
          <span class="q-num">Slide ${idx + 1}</span>
          <input type="text" data-k="tag" value="${esc(sl.tag || String(idx + 1).padStart(2, '0'))}" style="width:74px; padding:3px 7px; font-size:12px;" title="Badge tag">
          <select data-k="layout" style="padding:3px 7px; font-size:12px;" title="Scene layout">
            <option value="auto" ${(!sl.layout || sl.layout === 'auto') ? 'selected' : ''}>Layout: Auto (Smart Topic Mix)</option>
            <option value="hero_pill" ${sl.layout === 'hero_pill' ? 'selected' : ''}>Hero Pill Headline</option>
            <option value="punch_strike" ${sl.layout === 'punch_strike' ? 'selected' : ''}>Punch Strike Reveal</option>
            <option value="vs_compare" ${sl.layout === 'vs_compare' ? 'selected' : ''}>VS Split Compare</option>
            <option value="checklist_numbered" ${sl.layout === 'checklist_numbered' ? 'selected' : ''}>Numbered Checklist Card</option>
            <option value="checklist_green" ${sl.layout === 'checklist_green' ? 'selected' : ''}>Green Checkmark List</option>
            <option value="key_quote" ${sl.layout === 'key_quote' ? 'selected' : ''}>Key Quote Spotlight</option>
            <option value="flow_steps" ${sl.layout === 'flow_steps' ? 'selected' : ''}>Connected Flow Steps</option>
            <option value="folder_tree" ${sl.layout === 'folder_tree' ? 'selected' : ''}>Folder Tree (Tech)</option>
            <option value="terminal_typing" ${sl.layout === 'terminal_typing' ? 'selected' : ''}>Terminal Typing (Tech)</option>
          </select>
          <div class="row" style="margin-left:auto; gap:5px;">
            <button type="button" class="ghost sm" data-act="up" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="ghost sm" data-act="down" ${idx === s.slides.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="danger sm" data-act="del" ${s.slides.length <= 1 ? 'disabled' : ''}>✕</button>
          </div>
        </div>
        <input type="text" class="q-input" data-k="heading" value="${esc(sl.heading)}" placeholder="Bold headline (3-7 words)...">
        <textarea class="prompt-input" data-k="narration" style="min-height:58px; margin-bottom:8px; color:#fff; font-size:13.5px;" placeholder="Spoken narration for this point...">${esc(sl.narration)}</textarea>
        <div class="row" style="gap:8px; margin-bottom:8px;">
          <label class="field" style="flex:1;">
            Highlight Power Word(s) (accented in gold/coral)
            <input type="text" data-k="highlight" value="${esc(sl.highlight || '')}" placeholder="e.g. Mount Everest">
          </label>
        </div>
        <span class="prompt-label">Optional Google Flow Photo Prompt (leave image empty for pure kinetic text):</span>
        <textarea class="prompt-input" data-k="imagePrompt" placeholder="Optional realistic photo prompt...">${esc(sl.imagePrompt || '')}</textarea>
      `;

      left.querySelectorAll('[data-k]').forEach(el => {
        el.addEventListener('input', () => {
          sl[el.dataset.k] = el.value;
          persistScripts();
        });
        el.addEventListener('change', () => {
          sl[el.dataset.k] = el.value;
          persistScripts();
        });
      });

      left.querySelector('[data-act="up"]').addEventListener('click', () => {
        if (idx > 0) { [s.slides[idx - 1], s.slides[idx]] = [s.slides[idx], s.slides[idx - 1]]; persistScripts(); renderSlides(); }
      });
      left.querySelector('[data-act="down"]').addEventListener('click', () => {
        if (idx < s.slides.length - 1) { [s.slides[idx + 1], s.slides[idx]] = [s.slides[idx], s.slides[idx + 1]]; persistScripts(); renderSlides(); }
      });
      left.querySelector('[data-act="del"]').addEventListener('click', () => {
        if (s.slides.length <= 1) return;
        s.slides.splice(idx, 1); persistScripts(); renderTabs(); renderSlides();
      });

      const right = document.createElement('div');
      right.className = 'img-col';
      const frame = document.createElement('div');
      frame.className = `img-frame${pasteTargetIdx === idx ? ' paste-ready' : ''}`;
      frame.style.borderRadius = '14px';
      frame.tabIndex = 0;
      frame.title = 'Click & press Ctrl+V to paste a photo, or drag & drop an image here';
      if (saved) {
        frame.innerHTML = `<img src="${saved.url}?t=${saved.mtimeMs}" alt="Slide ${idx + 1}"><span class="img-badge">✓ Photo</span>`;
      } else {
        frame.innerHTML = `<div class="img-empty">Optional photo<br><small>Click &amp; Ctrl+V to paste,<br>or drag &amp; drop</small></div>`;
      }
      frame.addEventListener('click', () => armSlideForPaste(idx));
      frame.addEventListener('dragover', e => {
        e.preventDefault();
        frame.classList.add('drag-over');
      });
      frame.addEventListener('dragleave', () => frame.classList.remove('drag-over'));
      frame.addEventListener('drop', e => {
        e.preventDefault();
        frame.classList.remove('drag-over');
        const imgFile = extractImageFromDataTransfer(e.dataTransfer);
        if (imgFile) uploadSlideImageBlob(idx, imgFile, 'Dropped');
      });
      right.appendChild(frame);

      const acts = document.createElement('div');
      acts.className = 'img-actions';
      const genBtn = document.createElement('button');
      genBtn.type = 'button';
      genBtn.className = saved ? 'ghost sm' : 'primary sm';
      genBtn.textContent = saved ? '🔄 Regen' : '🎨 Flow';
      genBtn.addEventListener('click', () => generateSingleSlideImage(idx));

      const pasteBtn = document.createElement('button');
      pasteBtn.type = 'button';
      pasteBtn.className = 'ghost sm';
      pasteBtn.textContent = '📋 Paste';
      pasteBtn.title = 'Paste photo from clipboard into this slide (or click preview + Ctrl+V)';
      pasteBtn.addEventListener('click', () => pasteFromClipboardForSlide(idx));

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'ghost sm';
      upBtn.textContent = '📁 Upload';
      upBtn.addEventListener('click', () => {
        uploadTargetFile = fname;
        $('kinFileInput').value = '';
        $('kinFileInput').click();
      });
      acts.appendChild(genBtn);
      acts.appendChild(pasteBtn);
      acts.appendChild(upBtn);

      if (saved) {
        const clr = document.createElement('button');
        clr.type = 'button';
        clr.className = 'danger sm';
        clr.textContent = '🗑';
        clr.addEventListener('click', async () => {
          await fetch('/api/loksewa/delete-image', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setId: s.id, filename: fname })
          });
          await refreshImages();
        });
        acts.appendChild(clr);
      }

      right.appendChild(acts);
      card.appendChild(left);
      card.appendChild(right);
      list.appendChild(card);
    });
  }

  async function refreshImages() {
    const s = getActive();
    if (!s) return;
    try {
      const r = await fetch(`/api/loksewa/state?setId=${encodeURIComponent(s.id)}`);
      const d = await r.json();
      if (!d.ok) return;
      imgMap = new Map((d.images || []).map(im => [im.name, im]));
      renderSlides();
    } catch {}
  }

  async function selectScript(id) {
    activeId = id;
    pasteTargetIdx = null;
    renderTabs();
    syncMeta();
    await refreshImages();
  }

  function pollJob(jobId, total) {
    activeJobId = jobId;
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try {
        const r = await fetch(`/api/generation-jobs/${encodeURIComponent(jobId)}`);
        const job = await r.json();
        if (!job?.ok) return;
        const p = job.progress || {};
        const done = (p.skipped || 0) + (p.savedCount || 0);
        if (p.lastSavedFile) await refreshImages();
        if (job.status === 'running' || job.status === 'queued') {
          $('kinStatus').textContent = `🎨 Flow generating optional slide photos... ${done} / ${p.total || total}`;
        } else if (job.status === 'completed' || job.status === 'done') {
          clearInterval(pollTimer); pollTimer = null; activeJobId = null;
          await refreshImages();
          $('kinStatus').textContent = `✅ Slide photo generation complete!`;
        } else if (job.status === 'failed' || job.status === 'error') {
          clearInterval(pollTimer); pollTimer = null; activeJobId = null;
          $('kinStatus').textContent = `❌ Flow error: ${job.error || 'Failed'}`;
        }
      } catch {}
    }, 1800);
  }

  async function generateSingleSlideImage(idx) {
    const s = getActive();
    const sl = s.slides[idx];
    const fname = slideFile(idx);
    const prompt = (sl.imagePrompt || '').trim() ||
      `Ultra-realistic DSLR editorial photograph representing ${sl.heading || s.title}, natural lighting, crisp sharp focus, no text, no watermark`;
    $('kinStatus').textContent = `🎨 Queueing Flow photo for Slide ${idx + 1}...`;
    try {
      const r = await fetch('/api/loksewa/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId: s.id, filename: fname, prompt, aspect: '16:9', day: idx + 1 })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Failed to start Flow image');
      pollJob(d.id, 1);
    } catch (err) { $('kinStatus').textContent = `❌ ${err.message}`; }
  }

  async function generateAllSlideImages() {
    const s = getActive();
    const items = s.slides.map((sl, idx) => ({
      rowId: String(idx + 1),
      filename: slideFile(idx),
      prompt: (sl.imagePrompt || '').trim() ||
        `Ultra-realistic DSLR editorial photograph representing ${sl.heading || s.title}, natural lighting, crisp sharp focus, no text, no watermark`
    }));
    $('kinStatus').textContent = `🚀 Generating ${items.length} optional slide photo(s) in Google Flow...`;
    try {
      const r = await fetch('/api/loksewa/generate-batch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId: s.id, overwrite: false, aspect: '16:9', concurrency: 4, items })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Batch failed');
      if (d.alreadyComplete) { $('kinStatus').textContent = `✅ All slide photos are already generated!`; return; }
      pollJob(d.id, items.length);
    } catch (err) { $('kinStatus').textContent = `❌ ${err.message}`; }
  }

  async function generateScriptAI(mode) {
    const topic = $('kinAiTopic').value.trim();
    if (!topic) { $('kinAiStatus').textContent = '⚠️ Enter a topic first (e.g. "5 Beautiful Things About Nepal").'; $('kinAiTopic').focus(); return; }
    const language = $('kinAiLang').value;
    const count = Number($('kinAiCount').value) || 5;
    const ep = mode === 'claude' ? '/api/loksewa/kinetic-claude-generate' : (mode === 'gemini-browser' ? '/api/loksewa/kinetic-gemini-browser-generate' : '/api/loksewa/kinetic-gemini-generate');
    const lbl = mode === 'claude' ? 'Claude' : (mode === 'gemini-browser' ? 'Gemini (Browser)' : 'Gemini API');
    const btns = [$('btnKinGenClaude'), $('btnKinGenGemBrowser'), $('btnKinGenGemApi')];
    btns.forEach(b => { b.disabled = true; });
    $('kinAiStatus').textContent = `✨ Asking ${lbl} to craft a viral ${count}-point kinetic script on "${topic}"...`;
    try {
      const r = await fetch(ep, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language, count })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Script generation failed');
      const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'viral';
      const newId = `kin-${slug}-${Date.now().toString(36).slice(-4)}`;
      scripts.unshift({
        id: newId,
        name: `⚡ ${d.title || topic}`,
        lang: language === 'nepali' ? 'Nepali' : (language === 'bilingual' ? 'Bilingual' : 'English'),
        title: d.title || topic,
        hook: d.hook || '',
        outro: d.outro || '',
        theme: 'random',
        voice: language === 'nepali' ? 'Kore' : 'Puck',
        slides: d.slides || []
      });
      persistScripts();
      $('kinAiStatus').textContent = `✅ ${lbl} created "${d.title || topic}" (${(d.slides || []).length} slides)!`;
      await selectScript(newId);
    } catch (err) {
      $('kinAiStatus').textContent = `❌ ${lbl} error: ${err.message}`;
    } finally {
      btns.forEach(b => { b.disabled = false; });
    }
  }

  async function renderKineticVideo() {
    const s = getActive();
    const spaceUrl = $('hfSpaceUrl').value.trim();
    const bearerToken = $('hfToken').value.trim();
    const btn = $('btnSendKinetic');
    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = '⏳ Rendering Viral Kinetic Video...';
    $('kinStatus').textContent = '🚀 Sending kinetic script + optional photos to your HF Space (/texttovideo-kinetic)...';

    try {
      const slidesPayload = s.slides.map((sl, idx) => ({
        tag: sl.tag,
        heading: sl.heading,
        narration: sl.narration,
        highlight: sl.highlight,
        layout: sl.layout || 'auto',
        imageFile: imgMap.has(slideFile(idx)) ? slideFile(idx) : undefined
      }));
      const r = await fetch('/api/loksewa/send-kinetic', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceUrl,
          bearerToken,
          setId: s.id,
          title: $('kinTitle').value.trim() || s.title,
          hook: $('kinHook').value.trim(),
          outro: $('kinOutro').value.trim(),
          theme: $('kinTheme').value,
          voice: $('kinVoice').value,
          playback_speed: Number($('kinSpeed').value) || 1.05,
          uploadToYoutube: $('kinUploadYt').checked,
          uploadToFacebook: $('kinUploadFb').checked,
          pageId: ($('kinFbPage').value === '__custom__' ? $('kinFbPageCustom').value.trim() : $('kinFbPage').value.trim()) || undefined,
          slides: slidesPayload
        })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Kinetic render failed');
      $('kinStatus').textContent = `🎉 Viral Kinetic Video ready! (${d.totalSlides} slides, ${d.clientImagesSent} photos) → ${d.filename}`;
      if (typeof window.__loksewaOnVideoRendered === 'function') {
        await window.__loksewaOnVideoRendered(d.videoUrl, d.filename, d.size, d.caption);
      }
    } catch (err) {
      $('kinStatus').textContent = `❌ Render error: ${err.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  }

  window.initKineticStudio = () => {
    $('btnKinGenClaude').addEventListener('click', () => generateScriptAI('claude'));
    $('btnKinGenGemBrowser').addEventListener('click', () => generateScriptAI('gemini-browser'));
    $('btnKinGenGemApi').addEventListener('click', () => generateScriptAI('gemini-api'));
    $('btnKinAddSlide').addEventListener('click', () => {
      const s = getActive();
      s.slides.push({
        tag: String(s.slides.length + 1).padStart(2, '0'),
        heading: '', narration: '', highlight: '', layout: 'auto', imagePrompt: ''
      });
      persistScripts(); renderTabs(); renderSlides();
    });
    $('btnKinGenAllPhotos').addEventListener('click', generateAllSlideImages);
    $('btnSendKinetic').addEventListener('click', renderKineticVideo);
    $('kinFbPage').addEventListener('change', () => {
      $('kinFbPageCustom').style.display = $('kinFbPage').value === '__custom__' ? 'inline-block' : 'none';
    });

    ['kinTitle', 'kinHook', 'kinOutro', 'kinTheme', 'kinVoice'].forEach(id => {
      const mapKey = { kinTitle: 'title', kinHook: 'hook', kinOutro: 'outro', kinTheme: 'theme', kinVoice: 'voice' }[id];
      $(id).addEventListener('input', () => { getActive()[mapKey] = $(id).value; persistScripts(); });
      $(id).addEventListener('change', () => { getActive()[mapKey] = $(id).value; persistScripts(); });
    });

    $('kinFileInput').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file || !uploadTargetFile) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const s = getActive();
        const r = await fetch('/api/loksewa/upload-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setId: s.id, filename: uploadTargetFile, dataUrl: reader.result })
        });
        const d = await r.json();
        if (d.ok) { $('kinStatus').textContent = `✅ Uploaded photo for ${uploadTargetFile}.`; await refreshImages(); }
      };
      reader.readAsDataURL(file);
    });

    document.addEventListener('paste', e => {
      const modeEl = $('modeKinetic');
      if (!modeEl || !modeEl.classList.contains('active')) return;
      const imgFile = extractImageFromDataTransfer(e.clipboardData);
      if (!imgFile) return;

      const s = getActive();
      if (!s || !s.slides.length) return;
      e.preventDefault();

      let targetIdx = null;
      const cardEl = e.target?.closest?.('#kinSlideList .q-card[data-slide-idx]');
      if (cardEl) {
        const parsed = Number(cardEl.dataset.slideIdx);
        if (Number.isInteger(parsed) && parsed >= 0 && parsed < s.slides.length) {
          targetIdx = parsed;
        }
      }
      if (targetIdx === null && Number.isInteger(pasteTargetIdx) && pasteTargetIdx >= 0 && pasteTargetIdx < s.slides.length) {
        targetIdx = pasteTargetIdx;
      }
      if (targetIdx === null) {
        const firstEmpty = s.slides.findIndex((_, i) => !imgMap.has(slideFile(i)));
        targetIdx = firstEmpty >= 0 ? firstEmpty : 0;
      }
      uploadSlideImageBlob(targetIdx, imgFile, 'Pasted');
    });

    renderTabs();
    syncMeta();
    refreshImages();
  };
})();
