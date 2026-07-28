/**
 * electionEngine — apuração final da campanha.
 *
 *  >= 50%  eleito no 1º turno
 *  35-50%  vai para o 2º turno contra um adversário gerado
 *  < 35%   derrotado
 *
 * O comparativo textual é sempre genérico: descreve o FORMATO da eleição
 * (polarizada, de centro, avassaladora), nunca um pleito, ano ou nome real.
 */

import { computeApproval } from './approvalEngine.js';
import { generateOpponent } from './draftEngine.js';
import { createRng, randInt } from './random.js';
import { round1 } from './approvalEngine.js';

export const LIMIAR_PRIMEIRO_TURNO = 50;
export const LIMIAR_SEGUNDO_TURNO = 35;

/** Voto efetivo: a rejeição corta parte do potencial mesmo com boa aprovação. */
export function votoEfetivo(aprovacao, attrs) {
  const rejeicao = attrs?.rejeicao ?? 50;
  const teto = 100 - rejeicao * 0.35;
  return Math.min(aprovacao, teto);
}

/**
 * Simula o 2º turno contra um adversário gerado.
 * A migração do centro é decidida por quem tem menor rejeição.
 */
export function simulateRunoff({ attrs, eixosPartido, aliados, modificadores, seed }) {
  const rng = createRng(seed ?? randInt(createRng(Date.now()), 1, 999999));
  const adversario = generateOpponent(rng);

  const meu = computeApproval({ attrs, eixosPartido, aliados, modificadores });
  const dele = computeApproval({ attrs: adversario.attrs, eixosPartido: adversario.eixos, aliados: [] });

  const meuVoto = votoEfetivo(meu.geral, attrs);
  const deleVoto = votoEfetivo(dele.geral, adversario.attrs);

  // Ruído de campanha de 2º turno: ±2 pontos.
  const ruido = (rng() - 0.5) * 4;

  const bruto = meuVoto + ruido;
  const total = bruto + deleVoto;
  const minhaFatia = total <= 0 ? 50 : (bruto / total) * 100;

  return {
    adversario,
    minhaAprovacao: meu.geral,
    aprovacaoAdversario: dele.geral,
    meuPercentual: round1(Math.min(99, Math.max(1, minhaFatia))),
    percentualAdversario: round1(Math.min(99, Math.max(1, 100 - minhaFatia))),
    venceu: minhaFatia > 50,
  };
}

/**
 * Resultado completo da eleição.
 *
 * @returns {{ status, aprovacao, percentualFinal, titulo, comparativo, runoff }}
 */
export function computeElectionResult({ attrs, eixosPartido, aliados, modificadores, seed }) {
  const { geral, porSegmento, detalhes, coligacao } = computeApproval({
    attrs,
    eixosPartido,
    aliados,
    modificadores,
  });

  const base = {
    aprovacao: geral,
    porSegmento,
    detalhes,
    coligacao,
  };

  if (geral >= LIMIAR_PRIMEIRO_TURNO) {
    return {
      ...base,
      status: 'eleito_primeiro_turno',
      percentualFinal: geral,
      titulo: 'Eleito no primeiro turno',
      comparativo: comparativoTextual(geral, 'primeiro_turno'),
      runoff: null,
    };
  }

  if (geral >= LIMIAR_SEGUNDO_TURNO) {
    const runoff = simulateRunoff({ attrs, eixosPartido, aliados, modificadores, seed });
    return {
      ...base,
      status: runoff.venceu ? 'eleito_segundo_turno' : 'derrotado_segundo_turno',
      percentualFinal: runoff.meuPercentual,
      titulo: runoff.venceu ? 'Eleito no segundo turno' : 'Derrotado no segundo turno',
      comparativo: comparativoTextual(runoff.meuPercentual, 'segundo_turno'),
      runoff,
    };
  }

  return {
    ...base,
    status: 'derrotado',
    percentualFinal: geral,
    titulo: 'Derrotado ainda no primeiro turno',
    comparativo: comparativoTextual(geral, 'primeiro_turno'),
    runoff: null,
  };
}

/**
 * Leitura genérica do formato do resultado. Nada aqui identifica pleito real:
 * são faixas percentuais e o tipo de eleição que costuma produzi-las.
 */
export function comparativoTextual(percentual, fase) {
  if (fase === 'segundo_turno') {
    if (percentual >= 60) return 'Resultado equivalente a um segundo turno decidido cedo, sem suspense na apuração.';
    if (percentual >= 53) return 'Resultado equivalente a uma vitória confortável de segundo turno.';
    if (percentual > 50) return 'Resultado equivalente a uma eleição polarizada, decidida na margem.';
    if (percentual >= 47) return 'Resultado equivalente a uma derrota apertada, do tipo que a campanha revisita por anos.';
    return 'Resultado equivalente a uma derrota clara na reta final.';
  }

  if (percentual >= 62) return 'Resultado equivalente a uma eleição avassaladora, com adversário sem palanque competitivo.';
  if (percentual >= 55) return 'Resultado equivalente a uma vitória ampla, construída no centro e sustentada pela base.';
  if (percentual >= 50) return 'Resultado equivalente a uma eleição decidida no limite, resolvida em turno único por pouco.';
  if (percentual >= 42) return 'Resultado equivalente a uma eleição de centro fragmentado, sem candidatura dominante.';
  if (percentual >= 35) return 'Resultado equivalente a uma candidatura de segundo pelotão que chegou viva ao fim.';
  if (percentual >= 25) return 'Resultado equivalente a uma campanha de nicho, forte no próprio quintal e invisível fora dele.';
  return 'Resultado equivalente a uma candidatura testemunhal, sem competitividade real.';
}
