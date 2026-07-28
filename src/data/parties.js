/**
 * 8 partidos aliados fictícios para a coligação.
 *
 * Siglas e nomes são inventados e não correspondem a nenhuma legenda real.
 * `eixos` segue a mesma escala do partido do jogador (-100 a 100).
 *
 *  - `cadeiras`: bancada fictícia (0-100), vira bônus de rede de aliados.
 *  - `fidelidade`: chance de NÃO abandonar a coligação numa crise (0-1).
 *  - `segmentoForte`: segmento que o partido ajuda a puxar.
 */

export const ALLY_PARTIES = [
  {
    id: 'pln',
    sigla: 'PLN',
    nome: 'Partido da Liberdade Nacional',
    lema: 'Menos Estado, mais iniciativa.',
    eixos: { economico: 80, costumes: -30 },
    cadeiras: 62,
    fidelidade: 0.55,
    segmentoForte: 'classe_media_empresarial',
  },
  {
    id: 'mut',
    sigla: 'MUT',
    nome: 'Movimento Unidade Trabalhista',
    lema: 'Salário na mesa, direito na carteira.',
    eixos: { economico: -75, costumes: 30 },
    cadeiras: 58,
    fidelidade: 0.75,
    segmentoForte: 'sul_sudeste_industrial',
  },
  {
    id: 'pcd',
    sigla: 'PCD',
    nome: 'Partido do Centro Democrático',
    lema: 'Estabilidade acima de tudo.',
    eixos: { economico: 10, costumes: 5 },
    cadeiras: 71,
    fidelidade: 0.4,
    segmentoForte: 'centro_indeciso',
  },
  {
    id: 'urp',
    sigla: 'URP',
    nome: 'União Renovadora Popular',
    lema: 'A periferia no centro da decisão.',
    eixos: { economico: -60, costumes: 55 },
    cadeiras: 44,
    fidelidade: 0.7,
    segmentoForte: 'nordeste_popular',
  },
  {
    id: 'pot',
    sigla: 'POT',
    nome: 'Partido da Ordem e Tradição',
    lema: 'Família, ordem e responsabilidade.',
    eixos: { economico: 35, costumes: -85 },
    cadeiras: 49,
    fidelidade: 0.68,
    segmentoForte: 'evangelico',
  },
  {
    id: 'par',
    sigla: 'PAR',
    nome: 'Partido Agrário Regional',
    lema: 'Quem produz sustenta o país.',
    eixos: { economico: 70, costumes: -50 },
    cadeiras: 37,
    fidelidade: 0.62,
    segmentoForte: 'agro',
  },
  {
    id: 'psv',
    sigla: 'PSV',
    nome: 'Partido Socioverde',
    lema: 'Justiça social e clima na mesma pauta.',
    eixos: { economico: -50, costumes: 85 },
    cadeiras: 26,
    fidelidade: 0.8,
    segmentoForte: 'jovem_universitario',
  },
  {
    id: 'mbi',
    sigla: 'MBI',
    nome: 'Movimento Base Independente',
    lema: 'Governabilidade se constrói votando.',
    eixos: { economico: 25, costumes: -15 },
    cadeiras: 80,
    fidelidade: 0.25,
    segmentoForte: 'centro_indeciso',
  },
];

export const ALLY_BY_ID = ALLY_PARTIES.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

export const MAX_ALLIES = 3;
