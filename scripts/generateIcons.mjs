/**
 * Gera os ícones PNG do PWA sem depender de nenhuma biblioteca de imagem.
 *
 * Rode com: npm run icons
 *
 * Desenha um escudo em traço dourado sobre fundo verde-musgo, rasterizando
 * na mão com supersampling 3×3. O PNG é montado direto (IHDR + IDAT + IEND)
 * usando só o zlib nativo do Node.
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const FUNDO = [36, 48, 38, 255]; // moss-800
const TRACO = [201, 172, 92, 255]; // brass-400
const MIOLO = [16, 22, 16, 255]; // moss-950

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

const TABELA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = TABELA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length, 0);
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo), 0);
  return Buffer.concat([tamanho, corpo, crc]);
}

/** @param {Uint8Array} rgba pixels RGBA, largura*altura*4 */
function encodePng(rgba, largura, altura) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // 10-12: compression, filter, interlace = 0

  // Cada scanline leva um byte de filtro (0 = None) na frente.
  const bruto = Buffer.alloc(altura * (largura * 4 + 1));
  for (let y = 0; y < altura; y += 1) {
    const destino = y * (largura * 4 + 1);
    bruto[destino] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * largura * 4, largura * 4).copy(bruto, destino + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(bruto, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Formas
// ---------------------------------------------------------------------------

/** Meia-largura do escudo na altura y (coordenadas normalizadas 0-1). */
function meiaLarguraEscudo(y) {
  const topo = 0.05;
  const ombro = 0.26;
  const base = 0.95;
  const maxima = 0.45;

  if (y < topo || y > base) return -1;
  if (y <= ombro) {
    // Canto superior levemente arredondado.
    const t = (y - topo) / (ombro - topo);
    return maxima * Math.min(1, 0.82 + 0.18 * Math.sqrt(t) + 0.18 * t);
  }
  const t = (y - ombro) / (base - ombro);
  return maxima * (1 - t ** 2.3);
}

/** O ponto está dentro do escudo, escalado em torno do centro visual? */
function dentroEscudo(x, y, escala) {
  const cx = 0.5;
  const cy = 0.47;
  const px = cx + (x - cx) / escala;
  const py = cy + (y - cy) / escala;
  const meia = meiaLarguraEscudo(py);
  return meia >= 0 && Math.abs(px - cx) <= meia;
}

/** Canto arredondado do fundo (0 = quadrado cheio, usado no maskable). */
function dentroFundo(x, y, raio) {
  if (raio <= 0) return true;
  const dx = Math.min(x, 1 - x);
  const dy = Math.min(y, 1 - y);
  if (dx >= raio || dy >= raio) return true;
  return (raio - dx) ** 2 + (raio - dy) ** 2 <= raio ** 2;
}

/**
 * @param {number} tamanho    lado do PNG em pixels
 * @param {number} escalaMarca fração do quadro ocupada pelo escudo
 * @param {number} raioCanto  0 para full-bleed (maskable)
 */
function desenharIcone(tamanho, { escalaMarca = 1, raioCanto = 0.18 } = {}) {
  const px = new Uint8Array(tamanho * tamanho * 4);
  const AMOSTRAS = 3;

  for (let y = 0; y < tamanho; y += 1) {
    for (let x = 0; x < tamanho; x += 1) {
      let fundo = 0;
      let traco = 0;
      let miolo = 0;

      // Supersampling: 9 amostras por pixel para suavizar as bordas.
      for (let sy = 0; sy < AMOSTRAS; sy += 1) {
        for (let sx = 0; sx < AMOSTRAS; sx += 1) {
          const u = (x + (sx + 0.5) / AMOSTRAS) / tamanho;
          const v = (y + (sy + 0.5) / AMOSTRAS) / tamanho;

          if (!dentroFundo(u, v, raioCanto)) continue;
          fundo += 1;

          const mu = 0.5 + (u - 0.5) / escalaMarca;
          const mv = 0.5 + (v - 0.5) / escalaMarca;

          if (dentroEscudo(mu, mv, 1)) {
            if (dentroEscudo(mu, mv, 0.74)) miolo += 1;
            else traco += 1;
          }
        }
      }

      const total = AMOSTRAS * AMOSTRAS;
      const i = (y * tamanho + x) * 4;

      if (fundo === 0) {
        px[i + 3] = 0;
        continue;
      }

      // Mistura fundo → miolo → traço conforme a cobertura de cada amostra.
      const pesoTraco = traco / total;
      const pesoMiolo = miolo / total;
      const pesoFundo = Math.max(0, fundo / total - pesoTraco - pesoMiolo);
      const somaPeso = pesoTraco + pesoMiolo + pesoFundo || 1;

      for (let c = 0; c < 3; c += 1) {
        px[i + c] = Math.round(
          (TRACO[c] * pesoTraco + MIOLO[c] * pesoMiolo + FUNDO[c] * pesoFundo) / somaPeso,
        );
      }
      px[i + 3] = Math.round((fundo / total) * 255);
    }
  }

  return encodePng(px, tamanho, tamanho);
}

// ---------------------------------------------------------------------------

const saidas = [
  ['public/icon-192.png', 192, { escalaMarca: 0.74, raioCanto: 0.19 }],
  ['public/icon-512.png', 512, { escalaMarca: 0.74, raioCanto: 0.19 }],
  // Maskable precisa de sangria total e da marca dentro da zona segura (~80%).
  ['public/icon-maskable-512.png', 512, { escalaMarca: 0.56, raioCanto: 0 }],
  ['public/apple-touch-icon.png', 180, { escalaMarca: 0.78, raioCanto: 0 }],
];

mkdirSync(resolve(RAIZ, 'public'), { recursive: true });

for (const [caminho, tamanho, opcoes] of saidas) {
  const png = desenharIcone(tamanho, opcoes);
  writeFileSync(resolve(RAIZ, caminho), png);
  console.log(`${caminho.padEnd(34)} ${tamanho}×${tamanho}  ${(png.length / 1024).toFixed(1)} kB`);
}
