// Tiempo transcurrido entre dos fechas de la historia, expresado en la unidad más grande que
// quepa (de minutos a milenios) y, además, contado en cada una de las unidades menores.
// Los meses y los años se cuentan por calendario (un mes es «hasta el mismo día del mes
// siguiente»), no como un número fijo de días.

export const SPAN_UNITS = ['millennium', 'century', 'decade', 'year', 'month', 'week', 'day', 'hour', 'minute'];
const MONTHS_IN = { millennium: 12000, century: 1200, decade: 120, year: 12, month: 1 };
const MINUTES_IN = { week: 10080, day: 1440, hour: 60, minute: 1 };

/** 'AAAA-MM-DD' o 'AAAA-MM-DDTHH:mm' -> componentes. `timed` indica si traía hora. */
function parse(str) {
  const m = /^(\d{1,6})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(str || '');
  if (!m) return null;
  return { y: Number(m[1]), mo: Number(m[2]) - 1, d: Number(m[3]), h: Number(m[4] || 0), mi: Number(m[5] || 0), timed: m[4] !== undefined };
}

/** Instante en milisegundos, sin zonas horarias ni cambios de hora (la historia no los tiene). */
function stamp(p) {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(p.y, p.mo, p.d);
  d.setUTCHours(p.h, p.mi, 0, 0);
  return d.getTime();
}

function daysInMonth(y, mo) {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(y, mo + 1, 0);
  return d.getUTCDate();
}

/** La misma fecha `n` meses después; si ese mes es más corto, su último día. */
function addMonths(p, n) {
  const total = p.y * 12 + p.mo + n;
  const y = Math.floor(total / 12);
  const mo = total - y * 12;
  return { ...p, y, mo, d: Math.min(p.d, daysInMonth(y, mo)) };
}

/**
 * Intervalo entre dos fechas (en cualquier orden). Devuelve null si son el mismo instante, o
 * { unit, count, lines, back }:
 * - unit y count: la unidad más grande que cabe y cuántas hay («4 años»);
 * - lines: el intervalo completo contado desde cada unidad, de esa a la más pequeña. Cada
 *   línea es una lista de [unidad, cantidad]: [['year', 4], ['month', 2], ['day', 3]…],
 *   [['month', 50], ['day', 3]…], [['day', 1523]…], …
 * - back: la segunda fecha es anterior a la primera.
 * Si alguna de las dos fechas no tiene hora, se cuenta por días enteros y no se bajan a horas ni minutos.
 */
export function spanBetween(first, second) {
  let a = parse(first);
  let b = parse(second);
  if (!a || !b) return null;
  const timed = a.timed && b.timed;
  if (!timed) {
    a = { ...a, h: 0, mi: 0 };
    b = { ...b, h: 0, mi: 0 };
  }
  const back = stamp(b) < stamp(a);
  if (back) [a, b] = [b, a];
  const totalMinutes = Math.round((stamp(b) - stamp(a)) / 60000);
  if (!totalMinutes) return null;

  // Meses de calendario completos y lo que sobra después de ellos.
  let months = (b.y - a.y) * 12 + (b.mo - a.mo);
  while (months > 0 && stamp(addMonths(a, months)) > stamp(b)) months--;
  const restMinutes = Math.round((stamp(b) - stamp(addMonths(a, months))) / 60000);

  /** El intervalo empezando a contar por la unidad `head`. */
  const express = (head) => {
    const out = [];
    let minutes;
    if (MONTHS_IN[head]) {
      const size = MONTHS_IN[head];
      const n = Math.floor(months / size);
      let rest = months - n * size;
      out.push([head, n]);
      if (size > 12) { out.push(['year', Math.floor(rest / 12)]); rest %= 12; }
      if (size > 1) out.push(['month', rest]);
      minutes = restMinutes;
      out.push(['day', Math.floor(minutes / 1440)]);
      minutes %= 1440;
      out.push(['hour', Math.floor(minutes / 60)], ['minute', minutes % 60]);
    } else {
      minutes = totalMinutes;
      for (const unit of ['week', 'day', 'hour', 'minute'].slice(['week', 'day', 'hour', 'minute'].indexOf(head))) {
        out.push([unit, Math.floor(minutes / MINUTES_IN[unit])]);
        minutes %= MINUTES_IN[unit];
      }
    }
    // Se conserva siempre la primera unidad; del resto, solo lo que no es cero.
    return out.filter(([unit, n], i) => i === 0 || (n > 0 && (timed || (unit !== 'hour' && unit !== 'minute'))));
  };

  const unit = months >= 12000 ? 'millennium' : months >= 1200 ? 'century' : months >= 120 ? 'decade' : months >= 12 ? 'year'
    : months >= 1 ? 'month' : totalMinutes >= 10080 ? 'week' : totalMinutes >= 1440 ? 'day' : totalMinutes >= 60 ? 'hour' : 'minute';
  const smallest = timed ? 'minute' : 'day';
  const lines = SPAN_UNITS.slice(SPAN_UNITS.indexOf(unit), SPAN_UNITS.indexOf(smallest) + 1).map(express);
  return { unit, count: lines[0][0][1], lines, back };
}
