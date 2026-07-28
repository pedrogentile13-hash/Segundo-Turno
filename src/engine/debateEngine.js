/**
 * debateEngine — pontuação do minigame de debate.
 *
 * Cada resposta gera impactos por segmento, filtrados por:
 *  1. audiência da emissora (quem realmente está assistindo);
 *  2. volatilidade do segmento (quem muda de ideia com facilidade);
 *  3. tom da resposta versus linha editorial da emissora.
 *
 * Responder no tom que a emissora premia amplifica o ganho. Responder no tom
 * que ela rejeita gera GAFE VIRAL: uma penalidade extra espalhada por toda a
 * audiência daquele canal, independente do conteúdo da resposta.
 */

import { SEGMENTS, SEGMENT_BY_ID } from '../data/segments.js';
import { BROADCASTER_BY_ID, TIMEOUT_ANSWER } from '../data/broadcasters.js';
import { round1 } from './approvalEngine.js';

const ESCALA_IMPACTO = 0.6; // converte o impacto bruto da opção em pontos de aprovação
const BONUS_TOM = 1.35;
const PERDAO_TOM = 0.8; // no tom certo, até o impacto negativo dói menos
const AGRAVO_GAFE = 1.2;
const ESCALA_GAFE = 0.6;

/**
 * Calcula o impacto de UMA resposta.
 *
 * @returns {{ impactos: object, gafe: boolean, tom: string, alinhado: boolean }}
 */
export function scoreAnswer(broadcasterId, opcao) {
  const emissora = BROADCASTER_BY_ID[broadcasterId];
  if (!emissora || !opcao) return { impactos: {}, gafe: false, tom: null, alinhado: false };

  const alinhado = emissora.tonsBonus.includes(opcao.tom);
  const gafe = emissora.tonsGafe.includes(opcao.tom);

  const impactos = {};

  for (const seg of SEGMENTS) {
    const audiencia = emissora.audiencia[seg.id] ?? 0.3;
    const bruto = opcao.impactos?.[seg.id] ?? 0;
    if (bruto === 0 && !gafe) continue;

    let valor = bruto * ESCALA_IMPACTO * emissora.multiplicador * audiencia * seg.volatilidade;

    if (alinhado) valor *= valor >= 0 ? BONUS_TOM : PERDAO_TOM;
    if (gafe) valor *= valor >= 0 ? 1 : AGRAVO_GAFE;

    if (gafe) {
      valor -= emissora.gafePenalidade * ESCALA_GAFE * audiencia * seg.volatilidade;
    }

    if (valor !== 0) impactos[seg.id] = round1(valor);
  }

  return { impactos, gafe, alinhado, tom: opcao.tom };
}

/** Resposta usada quando o timer estoura. */
export function timeoutAnswer() {
  return TIMEOUT_ANSWER;
}

/**
 * Soma os impactos de todas as respostas de um debate.
 *
 * @param {Array} respostas [{ broadcasterId, perguntaId, opcao }]
 */
export function runDebate(respostas = []) {
  const total = {};
  const porResposta = [];
  let gafes = 0;
  let acertosDeTom = 0;

  for (const resposta of respostas) {
    const resultado = scoreAnswer(resposta.broadcasterId, resposta.opcao);
    if (resultado.gafe) gafes += 1;
    if (resultado.alinhado) acertosDeTom += 1;

    for (const [segId, valor] of Object.entries(resultado.impactos)) {
      total[segId] = round1((total[segId] || 0) + valor);
    }
    porResposta.push({ ...resposta, ...resultado });
  }

  return {
    impactos: total,
    porResposta,
    gafes,
    acertosDeTom,
    saldo: round1(Object.values(total).reduce((a, b) => a + b, 0)),
  };
}

/** Texto curto de leitura do desempenho, usado na tela de fim de debate. */
export function debateVerdict({ gafes, acertosDeTom, saldo }, totalPerguntas) {
  if (gafes >= Math.ceil(totalPerguntas / 2)) {
    return 'Desastre de linha editorial: você passou o debate inteiro no tom errado para aquele canal.';
  }
  if (saldo > 12 && acertosDeTom >= totalPerguntas / 2) {
    return 'Debate dominado. Você leu o público do canal e falou a língua dele.';
  }
  if (saldo > 0) {
    return 'Saldo positivo, mas sem virada: você não perdeu o debate, só não ganhou nada de graça.';
  }
  if (saldo > -10) {
    return 'Empate técnico com desgaste. A campanha sai do estúdio um pouco mais leve do que entrou.';
  }
  return 'Noite ruim. O corte que vai circular amanhã não é o que a sua campanha queria.';
}

/** Nome legível — reexportado para as telas não importarem data direto. */
export function nomeSegmentoCurto(id) {
  return SEGMENT_BY_ID[id]?.curto ?? id;
}
