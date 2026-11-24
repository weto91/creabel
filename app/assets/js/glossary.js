// Diccionario: marca en el texto la primera aparición de cada término con un número
// en superíndice que enlaza con su definición, numerando por orden de aparición.
import { store } from './store.js';
import { htmlToText, sanitizeHtml } from './text.js';
import { wordRegex, splitAliases } from './mentions.js';

/**
 * Crea un anotador para una lectura o exportación completa. Se llama a annotate() con el
 * HTML de cada escena en orden de lectura; entries() devuelve después las definiciones
 * de los términos que han aparecido: [{ n, term, text }].
 */
export function createGlossary() {
  const pending = [];
  for (const term of store.list('term')) {
    const name = (term.name || '').trim();
    const regex = name ? wordRegex([name, ...splitAliases(term.data.aliases)], 'iu') : null;
    if (regex) pending.push({ term, name, regex });
  }
  const entries = [];

  return {
    entries: () => entries,

    /** Devuelve el HTML (ya saneado) con las marcas de los términos que aparecen por primera vez. */
    annotate(html) {
      const div = document.createElement('div');
      div.innerHTML = sanitizeHtml(html);
      if (!pending.length) return div.innerHTML;
      const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
      const nodes = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
      for (let node of nodes) {
        while (node && node.data && pending.length) {
          // De los términos aún sin marcar, el que aparece antes en este fragmento.
          let best = null;
          for (const p of pending) {
            const m = p.regex.exec(node.data);
            if (m && (!best || m.index < best.m.index || (m.index === best.m.index && m[0].length > best.m[0].length))) best = { p, m };
          }
          if (!best) break;
          const rest = node.splitText(best.m.index + best.m[0].length);
          const n = entries.length + 1;
          entries.push({ n, term: best.p.name, text: htmlToText(best.p.term.body).replace(/\s*\n+\s*/g, ' ') });
          pending.splice(pending.indexOf(best.p), 1);
          const link = document.createElement('a');
          link.setAttribute('id', 'glref-' + n);
          link.setAttribute('href', '#gl-' + n);
          link.textContent = String(n);
          const sup = document.createElement('sup');
          sup.className = 'gl';
          sup.append(link);
          rest.parentNode.insertBefore(sup, rest);
          node = rest;
        }
      }
      return div.innerHTML;
    },
  };
}
