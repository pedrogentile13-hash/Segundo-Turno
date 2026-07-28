/**
 * economyEngine — arrecadação, déficit, inflação e índices produtivos.
 *
 * Funções puras. O estado do regime entra e sai como objeto simples.
 *
 * Ideia central: o orçamento sempre soma 100 (é uma repartição), mas o GASTO
 * REAL cresce com guerra, com defesa cara e com território ocupado. Quando o
 * gasto real supera a arrecadação simulada, a diferença vira inflação — e
 * inflação alta derruba a aprovação mesmo com propaganda no talo.
 */

import { round1, clamp } from './approvalEngine.js';

const CURVA_LAFFER = 0.35; // perda de eficiência tributária em imposto muito alto
const PERSISTENCIA_INFLACAO = 0.72; // quanto da inflação do turno anterior fica
const ALIVIO_SUPERAVIT = 0.3;
const CUSTO_GUERRA_ANO = 11;
const CUSTO_TERRITORIO = 0.22;

/**
 * Arrecadação simulada.
 * Cresce com produção e com a alíquota, mas a curva de Laffer castiga
 * alíquotas extremas — e cada sistema tem sua própria eficiência de cobrança.
 */
export function computeArrecadacao({ regime, imposto, producao = 100, bonus = 0 }) {
  const p = regime.params;
  const aliquota = clamp(imposto, 0, 100);
  const razao = (aliquota / Math.max(1, p.impostoPadrao)) ** 0.9;
  const perda = CURVA_LAFFER * (aliquota / 100) ** 2;
  const arrecadacao = p.arrecadacaoBase * razao * p.eficienciaTributaria * (producao / 100) * (1 - perda) + bonus;
  return round1(Math.max(0, arrecadacao));
}

/**
 * Gasto real do turno. A repartição soma 100, mas o custo efetivo sobe com
 * defesa (equipamento é caro), guerra em andamento e território a administrar.
 */
export function computeGastoTotal({ regime, orcamento, state }) {
  const p = regime.params;
  const base = 100;
  const custoDefesa = (orcamento.defesa / 100) * p.riscoGuerra * 22;
  const custoGuerra = (state.guerraAnos || 0) * CUSTO_GUERRA_ANO;
  const excedenteTerritorio = Math.max(0, (state.territorio || 100) - 100) * CUSTO_TERRITORIO;
  return round1(base + custoDefesa + custoGuerra + excedenteTerritorio);
}

/** Nova inflação a partir do déficit do turno. */
export function computeInflacao({ regime, inflacaoAtual = 0, deficit }) {
  const p = regime.params;
  const pressao = Math.max(0, deficit) * p.sensibilidadeInflacao * 0.62;
  const alivio = Math.max(0, -deficit) * ALIVIO_SUPERAVIT;
  return round1(clamp(inflacaoAtual * PERSISTENCIA_INFLACAO + pressao - alivio, 0, 400));
}

/**
 * Índices do regime.
 *  - `producao`: capacidade produtiva (puxada por infra e educação)
 *  - `poderMilitar`: puxado por defesa, desgastado por guerra
 *
 * Os dois usam um modelo de ALVO, não de acúmulo: o orçamento define o
 * patamar que aquele nível de investimento sustenta, e o índice caminha até
 * lá aos poucos. É o que impede o país de virar uma bola de neve produtiva
 * que torna a arrecadação infinita depois de dez turnos.
 *
 * Os dois existem sempre; o painel mostra o que o sistema escolhido destaca.
 */
const INERCIA_PRODUCAO = 0.35;
const INERCIA_MILITAR = 0.4;

export function computeIndices({ regime, orcamento, state }) {
  const p = regime.params;

  const investimentoProdutivo = orcamento.infraestrutura * 1.1 + orcamento.educacao * 0.75;
  const alvoProducao = 60 + investimentoProdutivo * p.crescimentoIndustrial * 1.15;
  const producaoAtual = state.producao ?? 100;
  const producao = clamp(
    producaoAtual + (alvoProducao - producaoAtual) * INERCIA_PRODUCAO - (state.guerraAnos || 0) * 3,
    10,
    220,
  );

  const alvoMilitar = 20 + orcamento.defesa * 2.6 * p.crescimentoIndustrial - (state.guerraAnos || 0) * 6;
  const militarAtual = state.poderMilitar ?? 60;
  const poderMilitar = clamp(militarAtual + (alvoMilitar - militarAtual) * INERCIA_MILITAR, 0, 220);

  return { producao: round1(producao), poderMilitar: round1(poderMilitar) };
}

/** Valor exibido como índice principal do sistema escolhido. */
export function indicePrincipal(regime, indices) {
  return regime.indicePrincipal.id === 'poder_militar' ? indices.poderMilitar : indices.producao;
}

/**
 * Aprovação do regime. Propaganda ajuda, mas inflação alta atravessa a
 * propaganda: acima de ~8% ao ano o preço no mercado fala mais alto.
 */
export function computeAprovacaoRegime({ criticidade, inflacao, propagandaStock = 0 }) {
  const castigoInflacao = Math.max(0, inflacao - 8) * 0.85;
  return round1(clamp(100 - criticidade - castigoInflacao + propagandaStock * 0.14));
}

/** Snapshot econômico completo de um turno. */
export function computeEconomy({ regime, orcamento, imposto, state, bonusArrecadacao = 0 }) {
  const indices = computeIndices({ regime, orcamento, state });
  const arrecadacao = computeArrecadacao({
    regime,
    imposto,
    producao: indices.producao,
    bonus: bonusArrecadacao,
  });
  const gastoTotal = computeGastoTotal({ regime, orcamento, state });
  const deficit = round1(gastoTotal - arrecadacao);
  const inflacao = computeInflacao({ regime, inflacaoAtual: state.inflacao ?? 0, deficit });

  return { ...indices, arrecadacao, gastoTotal, deficit, inflacao };
}
