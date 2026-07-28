/**
 * draftEngine — sorteio das 8 rodadas de draft e consolidação do candidato.
 *
 * Regras:
 *  - 8 rodadas, uma por arquétipo (ordem embaralhada).
 *  - em cada rodada o jogador herda UM atributo do arquétipo da vez.
 *  - atributo escolhido trava e não aparece mais nas rodadas seguintes.
 *  - no fim, todos os 8 atributos estão preenchidos, cada um vindo de um
 *    arquétipo diferente.
 */

import { ARCHETYPES } from '../data/archetypes.js';
import { ATTRIBUTE_IDS } from '../data/attributes.js';
import { shuffle, createRng, randInt } from './random.js';

export const TOTAL_ROUNDS = 8;

export const VISIBILITY_MODES = [
  {
    id: 'normal',
    nome: 'Normal',
    descricao: 'Você vê o valor de cada atributo antes de escolher.',
  },
  {
    id: 'pro',
    nome: 'Pro',
    descricao: 'Os valores aparecem como "??". Só são revelados no fim do draft.',
  },
];

/** Monta a ordem dos arquétipos de uma partida. */
export function createDraftOrder(seed = Date.now()) {
  const rng = createRng(seed);
  return shuffle(rng, ARCHETYPES).map((a) => a.id);
}

/** Atributos ainda disponíveis dado o que já foi escolhido. */
export function availableAttributes(escolhas = []) {
  const travados = new Set(escolhas.map((e) => e.atributo));
  return ATTRIBUTE_IDS.filter((id) => !travados.has(id));
}

/** Constrói o objeto de atributos do candidato a partir das escolhas do draft. */
export function buildCandidateAttrs(escolhas = []) {
  const attrs = {};
  for (const escolha of escolhas) {
    attrs[escolha.atributo] = escolha.valor;
  }
  return attrs;
}

/** O draft está completo quando os 8 atributos foram preenchidos. */
export function isDraftComplete(escolhas = []) {
  return ATTRIBUTE_IDS.every((id) => escolhas.some((e) => e.atributo === id));
}

/**
 * Adversário de 2º turno: um candidato gerado com atributos aleatórios
 * plausíveis (nunca um monstro perfeito nem um espantalho).
 */
export function generateOpponent(rng = createRng()) {
  const attrs = {};
  for (const id of ATTRIBUTE_IDS) {
    attrs[id] = randInt(rng, 38, 84);
  }
  // Dois atributos de destaque, para o adversário ter cara de campanha real.
  const destaques = shuffle(
    rng,
    ATTRIBUTE_IDS.filter((id) => id !== 'rejeicao'),
  ).slice(0, 2);
  for (const id of destaques) {
    attrs[id] = randInt(rng, 80, 95);
  }
  attrs.rejeicao = randInt(rng, 34, 72);

  const eixos = {
    economico: randInt(rng, -80, 80),
    costumes: randInt(rng, -80, 80),
  };

  const nomes = [
    'A Candidata da Frente Ampla',
    'O Governador do Interior',
    'A Senadora Independente',
    'O Prefeito da Capital',
    'A Empresária do Setor Produtivo',
    'O Ex-Ministro da Pasta Econômica',
    'A Deputada da Bancada Comunitária',
    'O Delegado Aposentado',
  ];

  return {
    nome: nomes[randInt(rng, 0, nomes.length - 1)],
    attrs,
    eixos,
    destaques,
  };
}
