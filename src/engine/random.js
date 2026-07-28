/**
 * RNG determinístico (mulberry32). Funções puras: mesma seed, mesma partida.
 * Serve para reproduzir bugs e para o teste de sanidade dos engines.
 */

export function createRng(seed = Date.now()) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Sorteia um item de uma lista usando `pesoFn` como peso relativo. */
export function weightedPick(rng, items, pesoFn = (i) => i.peso ?? 1) {
  const total = items.reduce((sum, i) => sum + Math.max(0, pesoFn(i)), 0);
  if (total <= 0) return null;
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(0, pesoFn(item));
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

/** Sorteia uma chave de um objeto { chave: peso }. */
export function weightedPickKey(rng, pesos) {
  const entries = Object.entries(pesos);
  const total = entries.reduce((sum, [, p]) => sum + Math.max(0, p), 0);
  if (total <= 0) return entries[0]?.[0] ?? null;
  let roll = rng() * total;
  for (const [key, p] of entries) {
    roll -= Math.max(0, p);
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function shuffle(rng, arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
