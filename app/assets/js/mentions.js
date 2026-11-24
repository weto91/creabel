// Detección de menciones: encuentra en un texto los personajes, lugares, objetos y grupos
// del proyecto por su nombre (o sus otros nombres) y mantiene al día las etiquetas de la escena.
import { store } from './store.js';
import { htmlToText } from './text.js';
import { validIds, sceneLocationIds } from './model.js';
import { styleSheet, fold } from './style.js';

const DETECT_TYPES = ['character', 'location', 'object', 'group'];
const LIST_FIELDS = { character: 'characters', object: 'objects', group: 'groups' };

// Artículos y tratamientos: los del idioma de la novela (su hoja de revisión, style/<idioma>.js)
// y, siempre, los del español y el inglés.
let wordsFor = { novel: null };
function nameWords() {
  const lang = (store.project && store.project.language) || 'es';
  // La hoja ya preparada es siempre el mismo objeto: si no ha cambiado, sirve lo calculado.
  const novel = styleSheet(lang);
  if (wordsFor.novel === novel) return wordsFor;
  const sheets = [styleSheet('es'), styleSheet('en'), novel];
  const articles = [...new Set(sheets.flatMap((s) => s.articles))]
    .sort((a, b) => b.length - a.length)
    .map((a) => (/['’]$/.test(a) ? escapeRegex(a.slice(0, -1)) + "['’]" : escapeRegex(a) + '\\s+'));
  // «El faro», «The Lighthouse», «L’Isola»: el artículo del principio.
  const article = articles.length ? new RegExp(`^(?:${articles.join('|')})`, 'iu') : /^(?!)/;
  // Palabras que preceden a un nombre propio y no sirven por sí solas para reconocerlo.
  const titles = new Set(sheets.flatMap((s) => [...s.articles, ...s.titles]).flatMap((w) => [w, fold(w)]));
  wordsFor = { novel, article, titles };
  return wordsFor;
}

const norm = (s) => s.replace(/\s+/g, ' ').toLowerCase();
const startsUpper = (s) => /^\p{Lu}/u.test(s);

export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitAliases(text) {
  return String(text || '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

/** Expresión regular que busca cualquiera de las variantes como palabra completa. */
export function wordRegex(variants, flags = 'giu') {
  const alts = [...new Set(variants.map((v) => v.trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map((v) => escapeRegex(v).replace(/\s+/g, '\\s+'));
  if (!alts.length) return null;
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alts.join('|')})(?![\\p{L}\\p{N}_])`, flags);
}

/** Nombre de pila de un personaje («Ana Ríos» -> «Ana», «Don Quijote de la Mancha» -> «Quijote»). */
function firstName(name) {
  const tokens = name.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return null;
  let i = 0;
  const { titles } = nameWords();
  while (i < tokens.length - 1 && titles.has(tokens[i].toLowerCase().replace(/\.$/, ''))) i++;
  const token = tokens[i];
  return token && token.length >= 3 && startsUpper(token) ? token : null;
}

/** Formas con las que un elemento puede aparecer escrito en el texto. */
function entityVariants(entity, firstNameCount) {
  const out = [];
  const name = (entity.name || '').trim();
  if (name.length >= 2) {
    // Un nombre con artículo se busca sin él: «El faro» se reconoce en «el faro», «al faro»
    // o «del faro», y «Los Ríos» en «los Ríos» (pero no en «los ríos», que es otra cosa).
    const bare = name.replace(nameWords().article, '');
    out.push(bare !== name && bare.length >= 3 ? bare : name);
  }
  for (const alias of splitAliases(entity.data.aliases)) {
    if (alias.length >= 2) out.push(alias);
  }
  if (entity.type === 'character') {
    const first = firstName(name);
    // Solo si ningún otro personaje comparte ese nombre de pila.
    if (first && firstNameCount.get(first.toLowerCase()) === 1) out.push(first);
  }
  return out;
}

/**
 * Prepara la búsqueda con los elementos actuales del proyecto y devuelve una función
 * texto -> { counts: Map(id -> veces), firstPos: Map(id -> posición de la primera mención) }.
 */
export function buildDetector() {
  const firstNameCount = new Map();
  for (const c of store.list('character')) {
    const first = firstName((c.name || '').trim());
    if (first) firstNameCount.set(first.toLowerCase(), (firstNameCount.get(first.toLowerCase()) || 0) + 1);
  }
  const entries = [];
  for (const type of DETECT_TYPES) {
    for (const e of store.list(type)) {
      const variants = entityVariants(e, firstNameCount);
      const regex = wordRegex(variants, 'giu');
      if (!regex) continue;
      // Nombres propios de una sola palabra (personajes y grupos): exigen mayúscula inicial en el
      // texto, para que «Rosa» no se confunda con «rosa». Lugares y objetos suelen ser nombres
      // comunes («el puerto viejo») y se reconocen con cualquier grafía.
      const strict = new Set();
      if (type === 'character' || type === 'group') {
        for (const v of variants) if (startsUpper(v) && !/\s/.test(v.trim())) strict.add(norm(v));
      }
      entries.push({ id: e.id, regex, strict });
    }
  }
  return (text) => {
    const counts = new Map();
    const firstPos = new Map();
    for (const entry of entries) {
      entry.regex.lastIndex = 0;
      let m;
      while ((m = entry.regex.exec(text))) {
        if (entry.strict.has(norm(m[0])) && !startsUpper(m[0])) continue;
        counts.set(entry.id, (counts.get(entry.id) || 0) + 1);
        if (!firstPos.has(entry.id)) firstPos.set(entry.id, m.index);
      }
    }
    return { counts, firstPos };
  };
}

/**
 * Calcula los cambios de etiquetas de una escena a partir de lo detectado en su texto.
 * - Lo detectado se añade solo, salvo que el usuario lo haya quitado antes (ignoredTags).
 * - Lo que se añadió solo (autoTags) se retira si deja de mencionarse.
 * - Lo que el usuario marcó a mano no se toca nunca.
 * Devuelve el parche para scene.data o null si no hay cambios.
 */
export function computeAutoTags(scene, found) {
  const d = scene.data;
  const ignored = new Set(Array.isArray(d.ignoredTags) ? d.ignoredTags : []);
  const auto = new Set(Array.isArray(d.autoTags) ? d.autoTags : []);
  const patch = {};
  const live = new Set();

  for (const [type, key] of Object.entries(LIST_FIELDS)) {
    const stored = Array.isArray(d[key]) ? d[key] : [];
    const next = validIds(stored).filter((id) => !(auto.has(id) && !found.counts.has(id)));
    const detected = store.list(type)
      .filter((e) => found.counts.has(e.id))
      .sort((a, b) => found.firstPos.get(a.id) - found.firstPos.get(b.id));
    for (const e of detected) {
      if (!next.includes(e.id) && !ignored.has(e.id)) {
        next.push(e.id);
        auto.add(e.id);
      }
    }
    if (next.join() !== stored.join()) patch[key] = next;
    for (const id of next) live.add(id);
  }

  // Lugares: una escena puede tener varios, pero la detección solo propone uno, el más
  // mencionado (nombrar un sitio no es estar en él), y solo si no hay ninguno o el único que
  // hay lo puso ella. En cuanto el usuario elige alguno a mano, la lista es suya.
  const stored = sceneLocationIds(scene);
  let locations = stored;
  if (!stored.length || (stored.length === 1 && auto.has(stored[0]))) {
    const best = store.list('location')
      .filter((l) => found.counts.has(l.id) && !ignored.has(l.id))
      .sort((a, b) => found.counts.get(b.id) - found.counts.get(a.id) || found.firstPos.get(a.id) - found.firstPos.get(b.id))[0];
    locations = best ? [best.id] : [];
    if (locations.join() !== stored.join()) {
      patch.locations = locations;
      patch.locationId = locations[0] || null;
      if (best) auto.add(best.id);
    }
  }
  for (const id of locations) live.add(id);

  for (const id of [...auto]) if (!live.has(id)) auto.delete(id);
  const autoList = [...auto];
  if (autoList.join() !== (Array.isArray(d.autoTags) ? d.autoTags : []).join()) patch.autoTags = autoList;
  return Object.keys(patch).length ? patch : null;
}

/** Repasa todas las escenas del proyecto. Devuelve cuántas han cambiado. */
export async function detectAllScenes() {
  const texts = await store.sceneTexts();
  const detect = buildDetector();
  let changed = 0;
  for (const scene of store.list('scene')) {
    const patch = computeAutoTags(scene, detect(htmlToText(texts.get(scene.id) || '')));
    if (patch) {
      await store.patchData(scene.id, patch);
      changed++;
    }
  }
  return changed;
}
