const STOP_WORDS = new Set([
  'the', 'and', 'with', 'for', 'from', 'that', 'this', 'into', 'onto', 'over',
  'under', 'near', 'behind', 'front', 'inside', 'outside', 'about', 'each',
  'same', 'one', 'two', 'three', 'four', 'five', 'six', 'show', 'showing',
  'style', 'look', 'clear', 'clean', 'small', 'large', 'bright', 'warm',
  'scene', 'view', 'shot', 'photo', 'diagram', 'panel', 'strip', 'only',
  'not', 'without', 'other', 'while', 'where', 'when', 'how', 'can', 'are'
]);

export function parseCsv(text) {
  const input = String(text || '').replace(/^\uFEFF/, '');
  const records = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      if (input[i + 1] === '\n') i++;
      row.push(field);
      records.push(row);
      row = [];
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      records.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  const nonEmpty = records.filter(r => r.some(cell => String(cell).trim() !== ''));
  if (!nonEmpty.length) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map(h => String(h || '').trim());
  const rows = nonEmpty.slice(1).map(cells => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] !== undefined ? String(cells[idx]).trim() : '';
    });
    return obj;
  });
  return { headers, rows };
}

function pickField(obj, lowerMap, candidates) {
  for (const key of candidates) {
    const actual = lowerMap.get(key);
    if (actual !== undefined && obj[actual] !== undefined) return obj[actual];
  }
  return '';
}

function extractLessonTag(placement) {
  const text = String(placement || '');
  const lessonMatch = text.match(/\b(lesson|chapter|unit|module|part|appendix)\s*([0-9]+|[a-z])\b/i);
  if (lessonMatch) {
    return `${lessonMatch[1].toLowerCase()}${lessonMatch[2].toLowerCase()}`;
  }
  return '';
}

function extractSceneSlug(prompt, caption) {
  let source = String(prompt || '');
  const sceneMatch = source.match(/(?:Scene(?:\s*\([^)]*\))?:|Cut-away diagram:|Technical-but-friendly diagram:|Identification sheet:|Official sign chart\s*-)\s*(.+)$/i);
  if (sceneMatch) {
    source = sceneMatch[1];
  } else {
    source = source
      .replace(/Children's educational picture-book illustration[^.]*\./gi, ' ')
      .replace(/Nepali school children[^.]*\./gi, ' ')
      .replace(/STRICTLY NO text[^.]*\./gi, ' ')
      .replace(/Landscape,\s*minimum[^.]*\./gi, ' ')
      .replace(/Children:\s*only with school[^.]*\./gi, ' ')
      .replace(/Crop to [^.]*\./gi, ' ');
  }

  const words = source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^-+|-+$/g, ''))
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

  const picked = [];
  for (const w of words) {
    if (!picked.includes(w)) picked.push(w);
    if (picked.length >= 4) break;
  }

  if (picked.length) return picked.join('_');

  const capWords = String(caption || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)
    .slice(0, 4);
  return capWords.join('_');
}

export function buildIdentifiableFilename(row, index, usedNames = new Set()) {
  const idPart = String(row.id || `img-${String(index + 1).padStart(2, '0')}`)
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '') || `img-${String(index + 1).padStart(2, '0')}`;
  const lessonPart = extractLessonTag(row.placement);
  const slugPart = extractSceneSlug(row.prompt, row.caption);

  const base = [idPart, lessonPart, slugPart].filter(Boolean).join('_').slice(0, 100);
  let candidate = `${base}.jpg`;
  let counter = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    candidate = `${base}_${counter}.jpg`;
    counter++;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

export function cleanPromptForAi(row) {
  let text = String(row?.prompt || '')
    .replace(/-\s*NOT AI-generated[^.]*\./gi, '.')
    .replace(/\(do NOT generate with AI[^)]*\)/gi, '')
    .replace(/NOT AI-generated/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!row?.isAiDefault && text) {
    text = `Realistic educational textbook photograph or clean diagram. ${text}`;
  }
  return text;
}

export function makePhotorealisticPrompt(prompt) {
  let text = String(prompt || '')
    .replace(/Children's educational picture-book illustration for a Nepali Class 5 textbook,?\s*/gi, '')
    .replace(/Children's educational picture-book illustration[^.,]*[.,]\s*/gi, '')
    .replace(/warm hand-painted gouache look,?\s*/gi, '')
    .replace(/soft outlines,?\s*/gi, '')
    .replace(/bright flat colours,?\s*/gi, '')
    .replace(/bright natural colours,?\s*/gi, '')
    .replace(/picture-book illustration/gi, 'real-life photograph')
    .replace(/consistent character design across the book\.?/gi, '')
    .replace(/\(cut-away diagram style\)/gi, '')
    .replace(/Cut-away diagram:/gi, 'Real-life documentary view:')
    .replace(/Technical-but-friendly diagram:/gi, 'Real-life educational photograph:')
    .replace(/drawn as neat lines/gi, 'planted in neat rows')
    .replace(/a small bee drawn near him/gi, 'a peaceful outdoor setting')
    .replace(/\s+/g, ' ')
    .trim();

  return `Photorealistic documentary DSLR photograph in Katahari Rural Municipality, Morang, eastern Terai, Nepal (authentic Nepali people, local Terai village setting, natural daylight, real-world textures, candid photography, no illustration or painting style). ${text}`;
}

export function buildSearchQuery(row) {
  let brief = String(row?.prompt || '')
    .replace(/Landscape,\s*minimum[^.]*\./gi, ' ')
    .replace(/Children:\s*only with school[^.]*\./gi, ' ')
    .replace(/Crop to [^.]*\./gi, ' ')
    .replace(/Take from a real [^.]*\./gi, ' ')
    .replace(/Square crop 1:1[^.]*\./gi, ' ')
    .replace(/Minimum \d+ px\.?/gi, ' ')
    .replace(/Source:\s*the Gaunpalika[^.]*\./gi, ' ')
    .replace(/Ask the planning branch[^.]*\./gi, ' ')
    .replace(/Add a simple numbered legend[^.]*\./gi, ' ')
    .replace(/\(do NOT generate with AI[^)]*\)/gi, ' ')
    .replace(/- NOT AI-generated[^.]*\./gi, ' ')
    .replace(/Close-up macro photo showing the typical symptom\/pest:\s*/gi, '')
    .replace(/Official sign chart\s*-\s*/gi, '')
    .replace(/Identification sheet:\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Take first meaningful sentence or up to 10 words
  const firstSentence = brief.split(/[.।]/)[0].trim();
  const words = (firstSentence || brief).split(/\s+/).slice(0, 10).join(' ');
  return words || String(row?.caption || row?.id || '').trim();
}

export function mapCsvRows(parsed) {
  const headers = parsed?.headers || [];
  const lowerMap = new Map(headers.map(h => [h.toLowerCase().trim(), h]));
  const usedNames = new Set();

  return (parsed?.rows || []).map((raw, index) => {
    const id = pickField(raw, lowerMap, ['id', 'row_id', 'code', 'key', 'name', 'sl']) || `ROW-${index + 1}`;
    const type = (pickField(raw, lowerMap, ['type', 'kind', 'category']) || 'AI').toUpperCase();
    const placement = pickField(raw, lowerMap, ['placement', 'lesson', 'section', 'location']);
    const aspect = pickField(raw, lowerMap, ['aspect', 'aspect_ratio', 'ratio']) || '4:3';
    const width = pickField(raw, lowerMap, ['width', 'size']);
    const caption = pickField(raw, lowerMap, ['caption_ne', 'caption', 'title', 'label']);
    const labels = pickField(raw, lowerMap, ['labels_to_add_in_word', 'labels', 'notes', 'word_labels']);
    const prompt = pickField(raw, lowerMap, ['ai_prompt_or_photo_brief', 'prompt', 'ai_prompt', 'description', 'brief', 'text']);

    const nonAiNote = /not ai[- ]generated|do not generate with ai/i.test(prompt);
    const isAiType = type !== 'PH' && type !== 'GR' && !nonAiNote;

    const row = {
      index,
      day: index + 1,
      id,
      type,
      placement,
      aspect,
      width,
      caption,
      labels,
      prompt,
      isAiDefault: isAiType,
      selected: isAiType && prompt.length >= 10
    };
    row.searchQuery = buildSearchQuery(row);
    row.filename = buildIdentifiableFilename(row, index, usedNames);
    return row;
  });
}

export function suggestFolderSlug(fileName) {
  const base = String(fileName || '')
    .replace(/\.csv$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return base || 'csv-batch';
}
