// Lectura en voz alta con la voz del navegador (speechSynthesis). Lee párrafo a párrafo, para
// poder seguir el texto con la vista y porque algunos navegadores cortan las locuciones largas.

export const speechAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** Voces instaladas para un idioma («es», «en»…); las primeras, las de ese idioma exacto. */
export function voicesFor(lang) {
  if (!speechAvailable()) return [];
  const code = String(lang || 'es').toLowerCase().slice(0, 2);
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(code));
}

/**
 * Crea un lector. `getParagraphs()` devuelve los textos a leer; `onParagraph(i)` avisa de cuál
 * se está leyendo (−1 al terminar) y `onState(estado)` del estado: 'idle' | 'playing' | 'paused'.
 */
export function createReader({ getParagraphs, lang, onParagraph, onState }) {
  let state = 'idle';
  let list = [];
  let index = 0;
  let rate = 1;
  let voiceName = '';
  let token = 0; // invalida las locuciones de una lectura anterior

  const setState = (next) => { state = next; if (onState) onState(next); };

  const speakNext = () => {
    while (index < list.length && !list[index].trim()) index++;
    if (index >= list.length) { stop(); return; }
    const mine = ++token;
    const u = new SpeechSynthesisUtterance(list[index]);
    const voice = voicesFor(lang).find((v) => v.name === voiceName) || voicesFor(lang)[0];
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : lang || 'es';
    u.rate = rate;
    u.onend = () => { if (mine === token && state === 'playing') { index++; speakNext(); } };
    u.onerror = () => { if (mine === token) stop(); };
    if (onParagraph) onParagraph(index);
    window.speechSynthesis.speak(u);
  };

  function stop() {
    token++;
    if (speechAvailable()) window.speechSynthesis.cancel();
    if (onParagraph) onParagraph(-1);
    setState('idle');
  }

  return {
    get state() { return state; },
    get index() { return index; },
    get total() { return list.length; },
    /** Empieza a leer desde el párrafo `from`. */
    play(from = 0) {
      if (!speechAvailable()) return;
      token++;
      window.speechSynthesis.cancel();
      list = getParagraphs();
      index = Math.max(0, Math.min(from, list.length - 1));
      setState('playing');
      speakNext();
    },
    pause() {
      if (state !== 'playing') return;
      window.speechSynthesis.pause();
      setState('paused');
    },
    resume() {
      if (state !== 'paused') return;
      window.speechSynthesis.resume();
      setState('playing');
    },
    stop,
    /** Cambia la velocidad o la voz; si está leyendo, sigue desde el párrafo actual con el cambio. */
    set({ rate: nextRate, voice }) {
      if (nextRate) rate = nextRate;
      if (voice !== undefined) voiceName = voice;
      if (state === 'playing') {
        token++;
        window.speechSynthesis.cancel();
        speakNext();
      }
    },
  };
}
