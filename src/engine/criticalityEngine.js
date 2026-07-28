/**
 * criticalityEngine — a criticidade da população (0-100, quanto maior pior).
 *
 * Fórmula (versão calibrada da spec):
 *
 *   subida  = 0.40*repressao + 0.60*fome + 0.50*guerra + 0.30*desigualdade
 *   descida = 0.30*propagandaEstoque + 0.55*entregaEstoque
 *   delta   = (subida - descida) * ESCALA * multDificuldade * multSistema
 *             + castigo de inflação
 *
 * A diferença entre os dois redutores é o ponto do jogo:
 *  - PROPAGANDA é estoque TEMPORÁRIO: decai 40% por turno. Parou de gastar,
 *    o efeito evapora em dois ou três turnos.
 *  - ENTREGA REAL (educação/saúde/infra) é estoque PERMANENTE: acumula e não
 *    decai. Custa caro e demora, mas nunca é desfeita.
 *
 * Se criticidade chega a 100, o regime cai. A forma da queda (revolução,
 * golpe militar ou greve geral) é sorteada com peso do próprio sistema.
 */

import { SEGMENTS } from '../data/segments.js';
import { round1, clamp } from './approvalEngine.js';
import { weightedPickKey } from './random.js';

const ESCALA_TURNO = 0.16;
const DECAIMENTO_PROPAGANDA = 0.6; // sobra do estoque de propaganda a cada turno
const GANHO_ENTREGA = 0.062; // conversão do gasto social em estoque permanente
const TETO_ENTREGA = 90;
const CASTIGO_INFLACAO = 0.12;

const ORCAMENTO_PADRAO = { educacao: 20, saude: 20, defesa: 20, infraestrutura: 25, propaganda: 15 };

/**
 * Os 4 fatores de subida, todos normalizados em 0-100.
 */
export function computeFatores({ regime, orcamento, state }) {
  const p = regime.params;

  // Repressão: piso do sistema + aparato de defesa + pressão acumulada de
  // revoltas que precisaram ser contidas.
  const repressao = clamp(
    p.repressaoBase + (orcamento.defesa - 20) * 0.8 + (state.repressaoPressao || 0),
  );

  // Fome: escassez estrutural do sistema, aliviada por infraestrutura (e um
  // pouco por saúde), agravada por eventos e por queda de produção.
  const fome = clamp(
    p.escassezConsumo +
      52 -
      orcamento.infraestrutura * 1.35 -
      orcamento.saude * 0.45 +
      (state.fomeExtra || 0) -
      ((state.producao ?? 100) - 100) * 0.22,
  );

  // Guerra prolongada: cada ano de conflito pesa mais que o anterior.
  const anos = state.guerraAnos || 0;
  const guerra = clamp(anos * 16 + Math.max(0, anos - 2) * 8);

  // Desigualdade: piso do sistema, com deriva própria (liberalismo sobe
  // sozinho), aliviada por gasto social.
  const deriva = (p.desigualdadeDeriva || 0) * (state.turno || 0);
  const desigualdade = clamp(
    p.desigualdadeBase + deriva - (orcamento.educacao + orcamento.saude) * 0.42 + (state.desigualdadeExtra || 0),
  );

  return {
    repressao: round1(repressao),
    fome: round1(fome),
    guerra: round1(guerra),
    desigualdade: round1(desigualdade),
  };
}

/** Novo estoque de propaganda (temporário: decai todo turno). */
export function stepPropaganda({ regime, orcamento, state }) {
  const anterior = state.propagandaStock || 0;
  return round1(clamp(anterior * DECAIMENTO_PROPAGANDA + orcamento.propaganda * regime.params.propagandaMult, 0, 120));
}

/** Novo estoque de entrega real (permanente: só acumula). */
export function stepEntrega({ regime, orcamento, state }) {
  const anterior = state.entregaStock || 0;
  const mult = regime.params.entregaSocialMult || 1;
  const fluxo = (orcamento.educacao * 0.9 + orcamento.saude * 1.0 + orcamento.infraestrutura * 0.65) * mult;
  return round1(clamp(anterior + fluxo * GANHO_ENTREGA, 0, TETO_ENTREGA));
}

/**
 * Um passo de criticidade.
 *
 * @returns {{ criticidade, delta, fatores, subida, descida, propagandaStock, entregaStock }}
 */
export function computeCriticalityStep({ regime, dificuldade, orcamento, state }) {
  const fatores = computeFatores({ regime, orcamento, state });

  const propagandaStock = stepPropaganda({ regime, orcamento, state });
  const entregaStock = stepEntrega({ regime, orcamento, state });

  const subida =
    0.4 * fatores.repressao + 0.6 * fatores.fome + 0.5 * fatores.guerra + 0.3 * fatores.desigualdade;
  const descida = 0.3 * propagandaStock + 0.55 * entregaStock;

  const multDificuldade = dificuldade?.multiplicadorCriticidade ?? 1;
  const multSistema = regime.params.multiplicadorDescontentamento;

  let delta = (subida - descida) * ESCALA_TURNO * multDificuldade * multSistema;
  // Inflação atravessa a propaganda, mas satura: a partir de certo ponto a
  // população já está no limite e não fica "mais" revoltada por mais um dígito.
  delta += Math.min(6, Math.max(0, (state.inflacao || 0) - 8) * CASTIGO_INFLACAO);
  delta += state.criticidadeExtra || 0;

  const criticidade = round1(clamp((state.criticidade || 0) + delta));

  return {
    criticidade,
    delta: round1(delta),
    fatores,
    subida: round1(subida),
    descida: round1(descida),
    propagandaStock,
    entregaStock,
  };
}

/**
 * Simulação "seca" para o painel: mostra o que ACONTECERIA com o orçamento
 * atual sem consumir o turno. É o que alimenta os números em tempo real
 * enquanto o jogador arrasta os sliders.
 */
export function previewCriticality({ regime, dificuldade, orcamento, state }) {
  return computeCriticalityStep({ regime, dificuldade, orcamento, state });
}

// ---------------------------------------------------------------------------
// Colapso
// ---------------------------------------------------------------------------

export const CAUSAS_FIM = {
  revolucao: {
    id: 'revolucao',
    nome: 'Revolução popular',
    icone: '✊',
    texto:
      'A criticidade estourou e a rua tomou a decisão no lugar do gabinete. O regime foi derrubado de baixo para cima, sem negociação.',
  },
  golpe: {
    id: 'golpe',
    nome: 'Golpe militar',
    icone: '⚑',
    texto:
      'O alto comando concluiu que o custo de sustentar o governo era maior que o de removê-lo. A queda veio de dentro do próprio Estado.',
  },
  greve: {
    id: 'greve',
    nome: 'Greve geral',
    icone: '⏹',
    texto:
      'A paralisação travou transporte, porto e energia ao mesmo tempo. Sem economia funcionando, o regime perdeu a capacidade de governar.',
  },
  colapso_overextension: {
    id: 'colapso_overextension',
    nome: 'Colapso por sobre-extensão',
    icone: '🜂',
    texto:
      'O território ocupado passou do que a capacidade militar conseguia sustentar. As linhas de suprimento romperam e o sistema desmontou de fora para dentro — o mesmo desfecho que a história reservou aos regimes expansionistas.',
  },
  sobrevivencia: {
    id: 'sobrevivencia',
    nome: 'Sobrevivência estável',
    icone: '◈',
    texto:
      'O regime chegou ao fim do período simulado de pé. Não é vitória triunfal: é a coisa mais rara nesse tipo de jogo, que é durar.',
  },
};

/** Sorteia a forma da queda com peso do sistema. */
export function pickCollapseCause(regime, rng) {
  const causaId = weightedPickKey(rng, regime.params.pesosFim);
  return CAUSAS_FIM[causaId] ?? CAUSAS_FIM.revolucao;
}

/**
 * Checa todas as condições de fim de jogo.
 * @returns {object|null} causa do fim, ou null se o regime segue.
 */
export function checkGameOver({ regime, dificuldade, state, rng }) {
  if (dificuldade?.overextension && regime.params.expansionista) {
    const territorio = state.territorio ?? 100;
    const limite = regime.params.limiteTerritorioSeguro;
    // Cada ponto de poder militar sustenta só uma fração do território. É a
    // razão de a expansão acelerada sempre ultrapassar a própria logística.
    const sustentavel = limite + (state.poderMilitar ?? 0) * 0.55;
    if (territorio > sustentavel) {
      return { ...CAUSAS_FIM.colapso_overextension, territorio: round1(territorio), sustentavel: round1(sustentavel) };
    }
  }

  if ((state.criticidade || 0) >= 100) {
    return pickCollapseCause(regime, rng);
  }

  if ((state.riscoGolpe || 0) >= 100) {
    return CAUSAS_FIM.golpe;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Reação por segmento populacional (dificuldade Médio e Difícil)
// ---------------------------------------------------------------------------

/**
 * Como cada um dos 9 segmentos está reagindo ao governo agora.
 * Parte da aprovação geral do regime e ajusta pela reação do segmento a cada
 * linha do orçamento.
 */
export function computeRegimeSegments({ orcamento, aprovacaoBase, inflacao = 0 }) {
  const resultado = {};
  for (const seg of SEGMENTS) {
    const reacao = seg.reacaoOrcamento || {};
    let ajuste = 0;
    for (const [linha, peso] of Object.entries(reacao)) {
      const padrao = ORCAMENTO_PADRAO[linha] ?? 20;
      ajuste += peso * ((orcamento[linha] ?? padrao) - padrao) * 0.9;
    }
    const castigoInflacao = Math.max(0, inflacao - 8) * 0.5 * seg.volatilidade;
    resultado[seg.id] = round1(clamp(aprovacaoBase + ajuste - castigoInflacao));
  }
  return resultado;
}
