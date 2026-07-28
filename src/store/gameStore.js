/**
 * Estado global da partida (Zustand — escolhido por ser bem mais leve que
 * Context + reducers para o volume de estado que este jogo tem).
 *
 * Regra da casa: NENHUMA fórmula mora aqui. A store só guarda o estado e
 * chama os engines. Isso mantém a matemática testável fora do React.
 */

import { create } from 'zustand';

import { ARCHETYPE_BY_ID } from '../data/archetypes.js';
import { ALLY_BY_ID, MAX_ALLIES } from '../data/parties.js';
import { DEFAULT_BUDGET, REGIME_BY_ID, DIFFICULTY_BY_ID } from '../data/regimes.js';

import { createDraftOrder, buildCandidateAttrs, isDraftComplete, TOTAL_ROUNDS } from '../engine/draftEngine.js';
import { computeApproval, computeOverall, computeDominantProfile } from '../engine/approvalEngine.js';
import { rollCampaignEvent, applyCampaignEvent } from '../engine/eventEngine.js';
import { computeElectionResult } from '../engine/electionEngine.js';
import { createRegimeState, advanceTurn, previewTurn, normalizeBudget, newSeed } from '../engine/regimeEngine.js';
import { createRng } from '../engine/random.js';
import { clamp } from '../engine/approvalEngine.js';

const campanhaInicial = () => ({
  seed: newSeed(),
  visibilidade: 'normal',
  ordem: [],
  rodada: 0,
  escolhas: [],
  draftCompleto: false,

  eixosPartido: { economico: 0, costumes: 0 },
  aliadosIds: [],
  partidoDefinido: false,

  modificadores: {},
  ajusteRejeicao: 0,
  debatesFeitos: [],
  eventosLog: [],
  eventoPendente: null,
  resultado: null,
});

export const useGameStore = create((set, get) => ({
  // =========================================================================
  // MODO CAMPANHA
  // =========================================================================
  campanha: campanhaInicial(),

  iniciarCampanha: (visibilidade = 'normal') => {
    const seed = newSeed();
    set({
      campanha: {
        ...campanhaInicial(),
        seed,
        visibilidade,
        ordem: createDraftOrder(seed),
      },
    });
  },

  definirVisibilidade: (visibilidade) =>
    set((s) => ({ campanha: { ...s.campanha, visibilidade } })),

  /** Herda um atributo do arquétipo da rodada atual. */
  escolherAtributo: (atributoId) => {
    const { campanha } = get();
    if (campanha.rodada >= TOTAL_ROUNDS) return;

    const arquetipoId = campanha.ordem[campanha.rodada];
    const arquetipo = ARCHETYPE_BY_ID[arquetipoId];
    if (!arquetipo) return;
    if (campanha.escolhas.some((e) => e.atributo === atributoId)) return;

    const escolhas = [
      ...campanha.escolhas,
      { rodada: campanha.rodada + 1, arquetipo: arquetipoId, atributo: atributoId, valor: arquetipo.attrs[atributoId] },
    ];

    set({
      campanha: {
        ...campanha,
        escolhas,
        rodada: campanha.rodada + 1,
        draftCompleto: isDraftComplete(escolhas),
      },
    });
  },

  definirEixos: (eixos) =>
    set((s) => ({
      campanha: {
        ...s.campanha,
        eixosPartido: {
          economico: clamp(eixos.economico, -100, 100),
          costumes: clamp(eixos.costumes, -100, 100),
        },
      },
    })),

  alternarAliado: (aliadoId) =>
    set((s) => {
      const atuais = s.campanha.aliadosIds;
      const jaTem = atuais.includes(aliadoId);
      if (!jaTem && atuais.length >= MAX_ALLIES) return s;
      return {
        campanha: {
          ...s.campanha,
          aliadosIds: jaTem ? atuais.filter((id) => id !== aliadoId) : [...atuais, aliadoId],
        },
      };
    }),

  confirmarPartido: () => set((s) => ({ campanha: { ...s.campanha, partidoDefinido: true } })),

  /** Soma o impacto de um debate concluído aos modificadores acumulados. */
  registrarDebate: (broadcasterId, resultadoDebate) =>
    set((s) => {
      const modificadores = { ...s.campanha.modificadores };
      for (const [segId, valor] of Object.entries(resultadoDebate.impactos)) {
        modificadores[segId] = (modificadores[segId] || 0) + valor;
      }
      return {
        campanha: {
          ...s.campanha,
          modificadores,
          debatesFeitos: [...s.campanha.debatesFeitos, { broadcasterId, ...resultadoDebate }],
        },
      };
    }),

  /**
   * Sorteia um evento de campanha. Devolve o evento resolvido (ou null) para a
   * tela poder mostrá-lo — o efeito já fica registrado no estado.
   */
  sortearEvento: () => {
    const { campanha } = get();
    const attrs = get().atributosCandidato();
    const aliados = get().aliados();
    const aprovacaoGeral = get().aprovacao().geral;

    const rng = createRng(campanha.seed + campanha.eventosLog.length * 104729 + campanha.debatesFeitos.length * 31);
    const evento = rollCampaignEvent(rng, {
      aprovacaoGeral,
      aliados,
      jaOcorridos: campanha.eventosLog.map((e) => e.evento.id),
    });
    if (!evento) return null;

    const resolvido = applyCampaignEvent(evento, { attrs, aliados, rng });

    set((s) => {
      const modificadores = { ...s.campanha.modificadores };
      for (const [segId, valor] of Object.entries(resolvido.impactos)) {
        modificadores[segId] = (modificadores[segId] || 0) + valor;
      }
      const aliadosIds = resolvido.aliadoRemovido
        ? s.campanha.aliadosIds.filter((id) => id !== resolvido.aliadoRemovido.id)
        : s.campanha.aliadosIds;

      return {
        campanha: {
          ...s.campanha,
          modificadores,
          aliadosIds,
          ajusteRejeicao: s.campanha.ajusteRejeicao + resolvido.rejeicaoDelta,
          eventosLog: [...s.campanha.eventosLog, resolvido],
        },
      };
    });

    return resolvido;
  },

  apurarEleicao: () => {
    const { campanha } = get();
    const resultado = computeElectionResult({
      attrs: get().atributosCandidato(),
      eixosPartido: campanha.eixosPartido,
      aliados: get().aliados(),
      modificadores: campanha.modificadores,
      seed: campanha.seed,
    });
    set((s) => ({ campanha: { ...s.campanha, resultado } }));
    return resultado;
  },

  reiniciarCampanha: () => set({ campanha: campanhaInicial() }),

  // ---- seletores derivados (sempre recalculados a partir dos engines) ------

  atributosCandidato: () => {
    const { campanha } = get();
    const attrs = buildCandidateAttrs(campanha.escolhas);
    if (campanha.ajusteRejeicao && typeof attrs.rejeicao === 'number') {
      attrs.rejeicao = clamp(attrs.rejeicao + campanha.ajusteRejeicao, 0, 99);
    }
    return attrs;
  },

  aliados: () => get().campanha.aliadosIds.map((id) => ALLY_BY_ID[id]).filter(Boolean),

  aprovacao: () => {
    const { campanha } = get();
    return computeApproval({
      attrs: get().atributosCandidato(),
      eixosPartido: campanha.eixosPartido,
      aliados: get().aliados(),
      modificadores: campanha.modificadores,
    });
  },

  overallCandidato: () => computeOverall(get().atributosCandidato()),

  perfilDominante: () => computeDominantProfile(get().atributosCandidato()),

  arquetipoAtual: () => {
    const { campanha } = get();
    return ARCHETYPE_BY_ID[campanha.ordem[campanha.rodada]] ?? null;
  },

  // =========================================================================
  // MODO REGIME
  // =========================================================================
  regime: null,
  orcamentoRascunho: { ...DEFAULT_BUDGET },
  impostoRascunho: 60,
  acaoRascunho: 'manter',

  iniciarRegime: (regimeId, dificuldadeId) => {
    const state = createRegimeState({ regimeId, dificuldadeId, seed: newSeed() });
    set({
      regime: state,
      orcamentoRascunho: { ...state.orcamento },
      impostoRascunho: state.imposto,
      acaoRascunho: 'manter',
    });
  },

  definirOrcamento: (orcamento) => set({ orcamentoRascunho: normalizeBudget(orcamento) }),

  definirImposto: (imposto) => set({ impostoRascunho: clamp(imposto, 0, 100) }),

  definirAcao: (acao) => set({ acaoRascunho: acao }),

  /** Confirma o turno: só aqui o estado do regime avança de verdade. */
  confirmarTurno: () => {
    const { regime, orcamentoRascunho, impostoRascunho, acaoRascunho } = get();
    if (!regime || regime.fim) return regime;
    const proximo = advanceTurn(regime, {
      orcamento: orcamentoRascunho,
      imposto: impostoRascunho,
      acao: acaoRascunho,
    });
    set({ regime: proximo, acaoRascunho: 'manter' });
    return proximo;
  },

  /** Números em tempo real do painel, sem consumir o turno. */
  previewRegime: () => {
    const { regime, orcamentoRascunho, impostoRascunho } = get();
    if (!regime) return null;
    return previewTurn(regime, orcamentoRascunho, impostoRascunho);
  },

  regimeAtual: () => {
    const { regime } = get();
    return regime ? REGIME_BY_ID[regime.regimeId] : null;
  },

  dificuldadeAtual: () => {
    const { regime } = get();
    return regime ? DIFFICULTY_BY_ID[regime.dificuldadeId] : null;
  },

  reiniciarRegime: () => set({ regime: null, orcamentoRascunho: { ...DEFAULT_BUDGET }, acaoRascunho: 'manter' }),
}));
