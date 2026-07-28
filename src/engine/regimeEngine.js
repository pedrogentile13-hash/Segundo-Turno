/**
 * regimeEngine — orquestra um turno do Modo Regime.
 *
 * É a única peça que junta economia + criticidade + eventos, e continua sendo
 * função pura: recebe o estado, devolve um estado NOVO. Nada de mutação, nada
 * de React aqui dentro.
 */

import { REGIME_BY_ID, DIFFICULTY_BY_ID, DEFAULT_BUDGET, BUDGET_KEYS } from '../data/regimes.js';
import { REGIME_EVENTS, REGIME_EVENT_BY_ID } from '../data/events.js';
import { createRng, weightedPick, randInt } from './random.js';
import { computeEconomy, computeAprovacaoRegime, indicePrincipal } from './economyEngine.js';
import {
  computeCriticalityStep,
  checkGameOver,
  computeRegimeSegments,
  CAUSAS_FIM,
} from './criticalityEngine.js';
import { round1, clamp } from './approvalEngine.js';

const CHANCE_EVENTO_BASE = 0.42;
const BONUS_ENCADEAMENTO = 2.6; // peso extra de um evento "armado" pelo anterior
const ANO_INICIAL = 1;

/** Normaliza uma repartição para somar exatamente 100. */
export function normalizeBudget(orcamento) {
  const total = BUDGET_KEYS.reduce((sum, k) => sum + (orcamento[k] || 0), 0);
  if (total === 0) return { ...DEFAULT_BUDGET };
  const escala = 100 / total;
  const saida = {};
  let acumulado = 0;
  BUDGET_KEYS.forEach((k, i) => {
    if (i === BUDGET_KEYS.length - 1) {
      saida[k] = round1(100 - acumulado);
    } else {
      saida[k] = round1((orcamento[k] || 0) * escala);
      acumulado += saida[k];
    }
  });
  return saida;
}

/**
 * Converte os 2 controles do modo Fácil (defesa × social) na repartição
 * completa de 5 linhas que os engines esperam.
 */
export function expandSimpleBudget({ defesa = 30, social = 55, propaganda = 15 }) {
  const totalSocial = Math.max(0, social);
  return normalizeBudget({
    educacao: totalSocial * 0.32,
    saude: totalSocial * 0.32,
    infraestrutura: totalSocial * 0.36,
    defesa,
    propaganda,
  });
}

/** Estado inicial de uma partida do Modo Regime. */
export function createRegimeState({ regimeId, dificuldadeId, seed = Date.now() }) {
  const regime = REGIME_BY_ID[regimeId];
  const dificuldade = DIFFICULTY_BY_ID[dificuldadeId];

  return {
    seed,
    regimeId,
    dificuldadeId,
    turno: 0,
    ano: ANO_INICIAL,
    orcamento: { ...DEFAULT_BUDGET },
    imposto: regime.params.impostoPadrao,

    criticidade: 22,
    propagandaStock: 0,
    entregaStock: 0,

    inflacao: 4,
    producao: 100,
    poderMilitar: 60,
    territorio: 100,

    guerraAnos: 0,
    fomeExtra: 0,
    repressaoPressao: 0,
    desigualdadeExtra: 0,
    criticidadeExtra: 0,
    riscoGolpe: 0,
    bonusArrecadacao: 0,

    historico: [],
    eventosOcorridos: [],
    eventosArmados: [],
    ultimoEvento: null,
    fim: null,
    turnosMax: dificuldade.turnos,
  };
}

/** Painel em tempo real: o que acontece SE o turno for confirmado assim. */
export function previewTurn(state, orcamentoProposto = null, impostoProposto = null) {
  const regime = REGIME_BY_ID[state.regimeId];
  const dificuldade = DIFFICULTY_BY_ID[state.dificuldadeId];
  const orcamento = normalizeBudget(orcamentoProposto || state.orcamento);
  const imposto = impostoProposto ?? state.imposto;

  const economia = computeEconomy({
    regime,
    orcamento,
    imposto,
    state,
    bonusArrecadacao: state.bonusArrecadacao,
  });

  const critico = computeCriticalityStep({
    regime,
    dificuldade,
    orcamento,
    state: { ...state, inflacao: economia.inflacao },
  });

  const aprovacao = computeAprovacaoRegime({
    criticidade: critico.criticidade,
    inflacao: economia.inflacao,
    propagandaStock: critico.propagandaStock,
  });

  return {
    regime,
    dificuldade,
    orcamento,
    imposto,
    economia,
    critico,
    aprovacao,
    indice: indicePrincipal(regime, economia),
    segmentos: dificuldade.mostrarSegmentos
      ? computeRegimeSegments({
          regime,
          orcamento,
          aprovacaoBase: aprovacao,
          inflacao: economia.inflacao,
        })
      : null,
  };
}

/** Sorteia (ou não) um evento histórico para o turno. */
export function rollRegimeEvent(state, rng) {
  const dificuldade = DIFFICULTY_BY_ID[state.dificuldadeId];
  if (!dificuldade.eventosAtivos) return null;
  if (rng() > CHANCE_EVENTO_BASE) return null;

  const armados = new Set(dificuldade.eventosEncadeados ? state.eventosArmados : []);
  const candidatos = REGIME_EVENTS.filter((e) => {
    if (e.id === 'golpe_iminente' && !armados.has(e.id)) return false;
    return true;
  });

  return weightedPick(rng, candidatos, (e) => e.peso * (armados.has(e.id) ? BONUS_ENCADEAMENTO : 1));
}

/** Aplica os efeitos de um evento histórico ao estado. */
export function applyRegimeEvent(state, evento) {
  if (!evento) return state;
  const ef = evento.efeitos || {};
  const dificuldade = DIFFICULTY_BY_ID[state.dificuldadeId];

  return {
    ...state,
    fomeExtra: clamp((state.fomeExtra || 0) + (ef.fome || 0), 0, 70),
    criticidadeExtra: (state.criticidadeExtra || 0) + (ef.criticidade || 0),
    producao: clamp((state.producao || 100) + (ef.producao || 0), 10, 220),
    inflacao: clamp((state.inflacao || 0) + (ef.inflacao || 0), 0, 400),
    guerraAnos: (state.guerraAnos || 0) + (ef.guerra || 0),
    poderMilitar: clamp((state.poderMilitar || 0) + (ef.poderMilitar || 0), 0, 220),
    repressaoPressao: clamp((state.repressaoPressao || 0) + (ef.repressaoPressao || 0), 0, 40),
    desigualdadeExtra: (state.desigualdadeExtra || 0) + (ef.desigualdade || 0),
    riscoGolpe: clamp((state.riscoGolpe || 0) + (ef.riscoGolpe || 0), 0, 100),
    bonusArrecadacao: (state.bonusArrecadacao || 0) + (ef.arrecadacaoBonus || 0),
    eventosOcorridos: [...state.eventosOcorridos, evento.id],
    eventosArmados: dificuldade.eventosEncadeados
      ? Array.from(new Set([...state.eventosArmados, ...(evento.encadeia || [])]))
      : state.eventosArmados,
    ultimoEvento: evento,
  };
}

/**
 * Avança um turno completo.
 *
 * Ordem: orçamento → evento → expansão → economia → criticidade → fim de jogo.
 *
 * @param {object} state
 * @param {object} params
 * @param {object} params.orcamento  repartição proposta (soma 100)
 * @param {number} params.imposto    alíquota 0-100
 * @param {string} params.acao       'manter' | 'expandir' | 'reprimir' | 'ceder'
 */
export function advanceTurn(state, { orcamento, imposto, acao = 'manter' } = {}) {
  if (state.fim) return state;

  const regime = REGIME_BY_ID[state.regimeId];
  const dificuldade = DIFFICULTY_BY_ID[state.dificuldadeId];
  const rng = createRng(state.seed + state.turno * 7919);

  let proximo = {
    ...state,
    orcamento: normalizeBudget(orcamento || state.orcamento),
    imposto: imposto ?? state.imposto,
    criticidadeExtra: 0,
    ultimoEvento: null,
  };

  // 1. Ação do jogador
  if (acao === 'expandir') {
    proximo.territorio = round1((proximo.territorio || 100) + 14);
    proximo.criticidadeExtra += 1.5;
    proximo.poderMilitar = clamp(proximo.poderMilitar + 4, 0, 220);
  } else if (acao === 'reprimir') {
    proximo.repressaoPressao = clamp((proximo.repressaoPressao || 0) - 8, 0, 40);
    proximo.criticidadeExtra += 3;
    proximo.riscoGolpe = clamp((proximo.riscoGolpe || 0) - 6, 0, 100);
  } else if (acao === 'ceder') {
    proximo.criticidadeExtra -= 4;
    proximo.riscoGolpe = clamp((proximo.riscoGolpe || 0) + 9, 0, 100);
    proximo.repressaoPressao = clamp((proximo.repressaoPressao || 0) - 4, 0, 40);
  }

  // 2. Expansão forçada dos sistemas expansionistas (a armadilha histórica)
  if (regime.params.expansionista && regime.params.expansaoForcada > 0) {
    proximo.territorio = round1((proximo.territorio || 100) + regime.params.expansaoForcada);
  }

  // 3. Evento histórico do turno
  const evento = rollRegimeEvent(proximo, rng);
  if (evento) proximo = applyRegimeEvent(proximo, evento);

  // 4. Economia
  const economia = computeEconomy({
    regime,
    orcamento: proximo.orcamento,
    imposto: proximo.imposto,
    state: proximo,
    bonusArrecadacao: proximo.bonusArrecadacao,
  });

  proximo.inflacao = economia.inflacao;
  proximo.producao = economia.producao;
  proximo.poderMilitar = economia.poderMilitar;

  // 5. Criticidade
  const critico = computeCriticalityStep({
    regime,
    dificuldade,
    orcamento: proximo.orcamento,
    state: proximo,
  });

  proximo.criticidade = critico.criticidade;
  proximo.propagandaStock = critico.propagandaStock;
  proximo.entregaStock = critico.entregaStock;

  // 6. Desgastes que decaem sozinhos
  proximo.fomeExtra = round1(Math.max(0, (proximo.fomeExtra || 0) * 0.7));
  proximo.repressaoPressao = round1(Math.max(0, (proximo.repressaoPressao || 0) * 0.8));
  proximo.bonusArrecadacao = round1((proximo.bonusArrecadacao || 0) * 0.6);
  if (proximo.guerraAnos > 0 && rng() < 0.28) {
    proximo.guerraAnos = Math.max(0, proximo.guerraAnos - 1);
  }

  const aprovacao = computeAprovacaoRegime({
    criticidade: proximo.criticidade,
    inflacao: proximo.inflacao,
    propagandaStock: proximo.propagandaStock,
  });

  proximo.turno = state.turno + 1;
  proximo.aprovacao = aprovacao;
  proximo.historico = [
    ...state.historico,
    {
      turno: proximo.turno,
      // O registro leva o ano que ACABOU de ser jogado (`state.ano`), não o
      // próximo. Sem isso o eixo do gráfico começaria no ano 2.
      ano: state.ano,
      criticidade: proximo.criticidade,
      inflacao: proximo.inflacao,
      aprovacao,
      indice: indicePrincipal(regime, economia),
      evento: evento?.id ?? null,
    },
  ];
  proximo.ano = ANO_INICIAL + proximo.turno;

  // 7. Fim de jogo
  const fim = checkGameOver({ regime, dificuldade, state: proximo, rng });
  if (fim) {
    proximo.fim = { ...fim, turno: proximo.turno, ano: proximo.ano };
  } else if (proximo.turno >= dificuldade.turnos) {
    proximo.fim = { ...CAUSAS_FIM.sobrevivencia, turno: proximo.turno, ano: proximo.ano };
  }

  return proximo;
}

/** Resumo textual do desfecho, usado na tela de resultado. */
export function summarizeRun(state) {
  const regime = REGIME_BY_ID[state.regimeId];
  const dificuldade = DIFFICULTY_BY_ID[state.dificuldadeId];
  const anos = state.turno;
  const pico = state.historico.reduce((max, h) => Math.max(max, h.criticidade), 0);
  const mediaInflacao =
    state.historico.length === 0
      ? 0
      : round1(state.historico.reduce((s, h) => s + h.inflacao, 0) / state.historico.length);

  const unidade = state.dificuldadeId === 'dificil' ? 'anos' : 'turnos';

  return {
    regime,
    dificuldade,
    anos,
    unidade,
    picoCriticidade: round1(pico),
    mediaInflacao,
    sobreviveu: state.fim?.id === 'sobrevivencia',
    causa: state.fim ?? null,
    eventos: state.eventosOcorridos.map((id) => REGIME_EVENT_BY_ID[id]).filter(Boolean),
  };
}

/** Ações disponíveis no turno, conforme sistema e dificuldade. */
export function availableActions(state) {
  const regime = REGIME_BY_ID[state.regimeId];
  const dificuldade = DIFFICULTY_BY_ID[state.dificuldadeId];

  const acoes = [
    { id: 'manter', nome: 'Manter o curso', descricao: 'Nenhuma medida extraordinária neste turno.' },
  ];

  if (regime.params.expansionista && dificuldade.overextension) {
    acoes.push({
      id: 'expandir',
      nome: 'Expandir território',
      descricao: '+14 de território e um pouco de poder militar. Cuidado com o limite sustentável.',
    });
  }

  acoes.push(
    {
      id: 'reprimir',
      nome: 'Reprimir a dissidência',
      descricao: 'Alivia a pressão de rua agora e cobra a conta em criticidade depois.',
    },
    {
      id: 'ceder',
      nome: 'Ceder à pressão popular',
      descricao: 'Reduz criticidade, mas o alto comando registra a concessão como fraqueza.',
    },
  );

  return acoes;
}

/** Gerador de seed simples para novas partidas. */
export function newSeed() {
  return randInt(createRng(Date.now() ^ Math.floor(Math.random() * 1e9)), 1, 999999);
}
