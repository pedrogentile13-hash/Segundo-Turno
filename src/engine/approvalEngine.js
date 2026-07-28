/**
 * approvalEngine — aprovação por segmento eleitoral.
 *
 * Funções puras, sem JSX e sem estado. Toda entrada é explícita, o que deixa
 * o arquivo testável direto no Node (ver scripts/engineSmokeTest.mjs).
 */

import { SEGMENTS, SEGMENT_BY_ID } from '../data/segments.js';
import { ATTRIBUTE_IDS, effectiveValue } from '../data/attributes.js';
import { ARCHETYPES } from '../data/archetypes.js';

// ---------------------------------------------------------------------------
// Constantes de calibragem. Mexer aqui muda o "feeling" do jogo inteiro.
// ---------------------------------------------------------------------------
const PESO_IDEOLOGIA = 62; // amplitude da contribuição ideológica
const PIVO_ALINHAMENTO = 0.6; // alinhamento neutro (abaixo disso vira penalidade)
const PESO_ATRIBUTOS = 30; // amplitude da contribuição de atributos
const PESO_REJEICAO = 24; // amplitude do teto de rejeição
const DIST_MAX_EIXOS = Math.sqrt(200 * 200 + 200 * 200); // ~282.8

export const clamp = (valor, min = 0, max = 100) => Math.min(max, Math.max(min, valor));

export const round1 = (valor) => Math.round(valor * 10) / 10;

// ---------------------------------------------------------------------------
// Eixos ideológicos
// ---------------------------------------------------------------------------

/** Alinhamento entre dois pontos do espectro. 1 = idêntico, 0 = oposto total. */
export function axisAlignment(a, b) {
  const economico = 1 - Math.abs(a.economico - b.economico) / 200;
  const costumes = 1 - Math.abs(a.costumes - b.costumes) / 200;
  return { economico, costumes, media: (economico + costumes) / 2 };
}

/** Distância euclidiana normalizada (0 a 1) entre dois pontos do espectro. */
export function axisDistance(a, b) {
  const de = a.economico - b.economico;
  const dc = a.costumes - b.costumes;
  return Math.sqrt(de * de + dc * dc) / DIST_MAX_EIXOS;
}

/** Segmento cujo eixo está mais próximo do partido do jogador. */
export function segmentoMaisAlinhado(eixosPartido) {
  let melhor = SEGMENTS[0];
  let melhorDist = Infinity;
  for (const seg of SEGMENTS) {
    const d = axisDistance(eixosPartido, seg.eixos);
    if (d < melhorDist) {
      melhorDist = d;
      melhor = seg;
    }
  }
  return melhor;
}

// ---------------------------------------------------------------------------
// Coligação
// ---------------------------------------------------------------------------

/**
 * Analisa a coligação: bônus de bancada e penalidade de "racha de base".
 *
 * A racha nasce da MAIOR distância entre quaisquer dois integrantes (incluindo
 * o partido do jogador). Coligação larga demais no espectro custa aprovação
 * justamente no segmento mais fiel ao candidato.
 */
export function analyzeCoalition(eixosPartido, aliados = []) {
  const membros = [{ id: '__jogador__', eixos: eixosPartido }, ...aliados];

  let distanciaMax = 0;
  let par = null;
  for (let i = 0; i < membros.length; i += 1) {
    for (let j = i + 1; j < membros.length; j += 1) {
      const d = axisDistance(membros[i].eixos, membros[j].eixos);
      if (d > distanciaMax) {
        distanciaMax = d;
        par = [membros[i], membros[j]];
      }
    }
  }

  const segmentoRacha = segmentoMaisAlinhado(eixosPartido);
  const rachaPenalidade = clamp((distanciaMax - 0.35) * 55, 0, 20);

  const cadeiras = aliados.reduce((sum, a) => sum + (a.cadeiras || 0), 0);
  const bonusBancada = clamp((cadeiras / 100) * 5.5, 0, 12);

  // O bônus de bancada se espalha: metade no centro (governabilidade) e
  // metade no segmento forte de cada aliado.
  const bonusPorSegmento = {};
  bonusPorSegmento.centro_indeciso = bonusBancada * 0.5;
  for (const aliado of aliados) {
    const seg = aliado.segmentoForte;
    if (!seg) continue;
    const contrib = ((aliado.cadeiras || 0) / 100) * 6;
    bonusPorSegmento[seg] = (bonusPorSegmento[seg] || 0) + contrib;
  }

  return {
    distanciaMax: round1(distanciaMax * 100) / 100,
    parMaisDistante: par ? [par[0].id, par[1].id] : null,
    rachaPenalidade: round1(rachaPenalidade),
    segmentoRacha: rachaPenalidade > 0 ? segmentoRacha.id : null,
    segmentoRachaNome: segmentoRacha.nome,
    bonusBancada: round1(bonusBancada),
    bonusPorSegmento,
    cadeirasTotais: cadeiras,
  };
}

// ---------------------------------------------------------------------------
// Aprovação por segmento
// ---------------------------------------------------------------------------

/** Contribuição ideológica de um segmento (pode ser negativa). */
function contribuicaoIdeologica(seg, eixosPartido) {
  const align = axisAlignment(eixosPartido, seg.eixos);
  return seg.pesoIdeologico * (align.media - PIVO_ALINHAMENTO) * PESO_IDEOLOGIA;
}

/** Contribuição dos atributos, normalizada para o intervalo ±PESO_ATRIBUTOS. */
function contribuicaoAtributos(seg, attrs) {
  let soma = 0;
  let magnitude = 0;
  for (const [attrId, afinidade] of Object.entries(seg.afinidades)) {
    const valor = attrs[attrId];
    if (typeof valor !== 'number') continue;
    soma += afinidade * ((valor - 50) / 49);
    magnitude += Math.abs(afinidade);
  }
  if (magnitude === 0) return 0;
  return (soma / magnitude) * PESO_ATRIBUTOS;
}

/** Penalidade de rejeição: o "teto" do candidato naquele segmento. */
function penalidadeRejeicao(seg, attrs) {
  const rejeicao = attrs.rejeicao ?? 50;
  return seg.sensibilidadeRejeicao * (rejeicao / 99) * PESO_REJEICAO;
}

/**
 * Aprovação de todos os 9 segmentos.
 *
 * @param {object} params
 * @param {object} params.attrs           atributos do candidato (0-99)
 * @param {object} params.eixosPartido    { economico, costumes }
 * @param {Array}  params.aliados         partidos da coligação
 * @param {object} params.modificadores   { segmentoId: delta } de eventos/debates
 * @returns {{ porSegmento: object, detalhes: object, coligacao: object }}
 */
export function computeSegmentApproval({
  attrs,
  eixosPartido = { economico: 0, costumes: 0 },
  aliados = [],
  modificadores = {},
  coligacao = null,
}) {
  const analiseColigacao = coligacao || analyzeCoalition(eixosPartido, aliados);

  const porSegmento = {};
  const detalhes = {};

  for (const seg of SEGMENTS) {
    const ideologia = contribuicaoIdeologica(seg, eixosPartido);
    const atributos = contribuicaoAtributos(seg, attrs);
    const rejeicao = -penalidadeRejeicao(seg, attrs);
    const coalizao = analiseColigacao.bonusPorSegmento[seg.id] || 0;
    const racha = analiseColigacao.segmentoRacha === seg.id ? -analiseColigacao.rachaPenalidade : 0;
    const eventos = modificadores[seg.id] || 0;

    const bruto = seg.base + ideologia + atributos + rejeicao + coalizao + racha + eventos;
    porSegmento[seg.id] = round1(clamp(bruto));
    detalhes[seg.id] = {
      base: seg.base,
      ideologia: round1(ideologia),
      atributos: round1(atributos),
      rejeicao: round1(rejeicao),
      coalizao: round1(coalizao),
      racha: round1(racha),
      eventos: round1(eventos),
      total: porSegmento[seg.id],
    };
  }

  return { porSegmento, detalhes, coligacao: analiseColigacao };
}

/** Aprovação geral ponderada pelo tamanho populacional fictício de cada segmento. */
export function computeOverallApproval(porSegmento) {
  let soma = 0;
  let pesos = 0;
  for (const seg of SEGMENTS) {
    const valor = porSegmento[seg.id];
    if (typeof valor !== 'number') continue;
    soma += valor * seg.peso;
    pesos += seg.peso;
  }
  return pesos === 0 ? 0 : round1(soma / pesos);
}

/** Atalho: aprovação geral direto dos insumos. */
export function computeApproval(params) {
  const resultado = computeSegmentApproval(params);
  return {
    ...resultado,
    geral: computeOverallApproval(resultado.porSegmento),
  };
}

// ---------------------------------------------------------------------------
// Perfil do candidato
// ---------------------------------------------------------------------------

/** Overall do candidato: média dos 8 atributos, com rejeição contando invertida. */
export function computeOverall(attrs) {
  const valores = ATTRIBUTE_IDS.map((id) => effectiveValue(id, attrs[id] ?? 0));
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  return Math.round(media);
}

/**
 * Perfil dominante: qual arquétipo o candidato montado mais "parece".
 * Distância euclidiana no espaço dos 8 atributos, com rejeição invertida
 * dos dois lados para não premiar semelhança em defeito.
 */
export function computeDominantProfile(attrs) {
  const ranking = ARCHETYPES.map((arq) => {
    let soma = 0;
    for (const id of ATTRIBUTE_IDS) {
      const a = effectiveValue(id, attrs[id] ?? 0);
      const b = effectiveValue(id, arq.attrs[id] ?? 0);
      soma += (a - b) ** 2;
    }
    const distancia = Math.sqrt(soma) / Math.sqrt(ATTRIBUTE_IDS.length * 99 * 99);
    return { arquetipo: arq, distancia, afinidade: round1((1 - distancia) * 100) };
  }).sort((x, y) => x.distancia - y.distancia);

  return { dominante: ranking[0].arquetipo, ranking };
}

/** Nome legível do segmento (usado nas telas e nos logs do engine). */
export function nomeSegmento(id) {
  return SEGMENT_BY_ID[id]?.nome ?? id;
}
