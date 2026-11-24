// Extracción de rasgos clave a partir de texto libre, usando una hoja de palabras clave
// por idioma (traits/<idioma>.js, con el código del idioma sin variante: pt, sr…). No
// interpreta el texto: reconoce patrones como «sustantivo + adjetivos» («pelo marrón y
// lacio» -> Pelo marrón, Pelo lacio), rasgos sueltos («es alto») y edades («tiene 34 años»),
// y descarta lo negado («no es alto»). La hoja que se usa es la del idioma de la novela.
import es from './traits/es.js';
import en from './traits/en.js';

const SHEETS = { es, en };
const compiled = new Map();
const missing = new Set();

const base = (lang) => String(lang || 'es').toLowerCase().split('-')[0];
// Sin hoja para ese idioma: la del español para el catalán y el gallego; la inglesa para el resto.
const fallbackOf = (code) => (['es', 'ca', 'gl'].includes(code) ? 'es' : 'en');

/** Carga (una vez) la hoja de rasgos de un idioma, si existe. */
export async function loadTraits(lang) {
  const code = base(lang);
  if (SHEETS[code] || missing.has(code)) return;
  try {
    SHEETS[code] = (await import(`./traits/${code}.js`)).default;
  } catch (err) {
    missing.add(code); // ese idioma no tiene hoja: se usa la de reserva
  }
}

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Con las reglas del idioma: en turco, «i» pasa a «İ».
const capitalize = (s, locale) => (s ? s.charAt(0).toLocaleUpperCase(locale) + s.slice(1) : s);

/** Clave para comparar rasgos sin distinguir mayúsculas ni acentos. */
export function traitKey(text) {
  return strip(String(text || '').trim());
}

function compile(lang) {
  const wanted = base(lang);
  const code = SHEETS[wanted] ? wanted : fallbackOf(wanted);
  if (compiled.has(code)) return compiled.get(code);
  const sheet = SHEETS[code];
  const nouns = new Map(); // forma sin acentos -> rasgo (feature)
  for (const feature of sheet.features) {
    const groups = new Set(feature.groups);
    for (const noun of feature.nouns) nouns.set(strip(noun), { groups, presence: !!feature.presence });
  }
  const adjectives = new Map(); // forma sin acentos -> { groups, canonical }
  for (const [group, words] of Object.entries(sheet.adjectives)) {
    for (const word of words) {
      for (const form of sheet.forms(strip(word))) {
        const entry = adjectives.get(form) || { groups: new Set(), canonical: word };
        entry.groups.add(group);
        adjectives.set(form, entry);
      }
    }
  }
  const standalone = new Map(); // forma sin acentos -> palabra canónica
  for (const word of sheet.standalone) {
    for (const form of sheet.forms(strip(word))) if (!standalone.has(form)) standalone.set(form, word);
  }
  const index = {
    nouns, adjectives, standalone,
    fillers: new Set(sheet.fillers.map(strip)),
    negations: new Set(sheet.negations.map(strip)),
    // Negaciones que van detrás del rasgo (en turco: «mavi değil», «sakalı yok»).
    negationsAfter: new Set((sheet.negationsAfter || []).map(strip)),
    age: sheet.age,
    prenominal: !!sheet.prenominal,
    copulas: new Set((sheet.copulas || []).map(strip)),
    // En alemán los sustantivos van con mayúscula: se dejan como estén escritos.
    keepNounCase: sheet.nounCase === 'keep',
    locale: code,
  };
  compiled.set(code, index);
  return index;
}

function tokenize(text) {
  const tokens = [];
  // Una palabra puede llevar apóstrofo («d’ulls») o punto volado («pàl·lid»).
  const re = /[\p{L}\p{N}]+(?:['’·][\p{L}\p{N}]+)*|[.,;:!?()«»"“”„—–\n]/gu;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[0];
    tokens.push({ raw, key: strip(raw).replace(/’/g, "'"), punct: !/[\p{L}\p{N}]/u.test(raw) });
  }
  return tokens;
}

/** Palabra tal como se mostrará: como la escribió el autor, corrigiendo el acento si falta. */
function display(token, canonical) {
  return token.key === strip(canonical) ? canonical : token.raw.toLowerCase();
}

function extractFrom(text, index, add) {
  const tokens = tokenize(text);
  const used = new Set();

  // ¿Hay una negación justo antes? («no es alto», «sin barba», «ni gordo»)
  const negated = (i) => {
    for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
      if (tokens[j].punct) {
        if (tokens[j].raw === ',') continue;
        break;
      }
      if (index.negations.has(tokens[j].key)) return true;
    }
    return false;
  };
  // ¿Y justo detrás? Solo en los idiomas que la ponen ahí («mavi değil»).
  const negatedAfter = (i) => {
    const next = tokens[i + 1];
    return index.negationsAfter.size > 0 && !!next && !next.punct && index.negationsAfter.has(next.key);
  };

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].punct) continue;
    const feature = index.nouns.get(tokens[i].key);
    if (!feature) continue;
    const allowed = (j) => {
      const adj = index.adjectives.get(tokens[j].key);
      if (!adj || used.has(j)) return null;
      for (const g of adj.groups) if (feature.groups.has(g)) return adj;
      return null;
    };
    const found = [];
    // Adjetivos pegados delante del sustantivo: «largos cabellos», «blue eyes».
    for (let j = i - 1; j >= 0 && i - j <= 3; j--) {
      if (tokens[j].punct || !allowed(j)) break;
      found.unshift(j);
    }
    // Adjetivos detrás: «pelo largo, negro y rizado», «the hair was long and dark».
    // En los idiomas que anteponen el adjetivo solo se mira detrás si sigue un verbo copulativo.
    const lookAfter = !index.copulas.size || (tokens[i + 1] && index.copulas.has(tokens[i + 1].key));
    for (let j = i + 1, steps = 0; lookAfter && j < tokens.length && steps < 10; j++, steps++) {
      const tk = tokens[j];
      if (tk.punct) {
        if (tk.raw === ',') continue;
        break;
      }
      if (index.nouns.has(tk.key)) break;
      if (allowed(j)) { found.push(j); continue; }
      if (index.fillers.has(tk.key)) continue;
      break;
    }
    used.add(i);
    if (negated(i) || negatedAfter(Math.max(i, ...found))) {
      for (const j of found) used.add(j);
      continue;
    }
    const noun = index.keepNounCase ? tokens[i].raw : tokens[i].raw.toLowerCase();
    let any = false;
    for (const j of found) {
      used.add(j);
      if (negated(j) && j > i) continue;
      const adjective = display(tokens[j], index.adjectives.get(tokens[j].key).canonical);
      add(capitalize(index.prenominal ? `${adjective} ${noun}` : `${noun} ${adjective}`, index.locale));
      any = true;
    }
    if (!any && feature.presence) add(capitalize(noun, index.locale));
  }

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].punct || used.has(i)) continue;
    const canonical = index.standalone.get(tokens[i].key);
    if (!canonical || negated(i) || negatedAfter(i)) continue;
    add(capitalize(display(tokens[i], canonical), index.locale));
  }

  for (const rule of index.age) {
    rule.regex.lastIndex = 0;
    let m;
    while ((m = rule.regex.exec(text))) add(rule.label.replace('{n}', m[1]));
  }
}

/**
 * segments: [{ text, context }]. `context` es la pregunta a la que responde el texto: si la
 * pregunta trata de un único rasgo («¿Cómo es su pelo?») una respuesta como «Marrón y lacio»
 * se entiende referida a él.
 * Devuelve la lista de rasgos, sin repetidos, en orden de aparición.
 */
export function extractTraits(segments, lang) {
  const index = compile(lang);
  const out = new Map();
  const add = (text) => {
    const key = traitKey(text);
    if (key && !out.has(key)) out.set(key, text);
  };
  for (const segment of segments) {
    let text = String(segment.text || '').trim();
    if (!text) continue;
    if (segment.context) {
      const topics = tokenize(segment.context).filter((tk) => !tk.punct && index.nouns.has(tk.key) && index.nouns.get(tk.key).groups.size);
      if (topics.length === 1) {
        const verb = index.copulas.size ? [...index.copulas][0] + ' ' : '';
        text = `${topics[0].raw} ${verb}${text}`;
      }
    }
    extractFrom(text, index, add);
  }
  return [...out.values()];
}
