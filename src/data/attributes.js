/**
 * Atributos do candidato.
 *
 * Todos vão de 0 a 99. `inverted: true` significa que valor ALTO é RUIM
 * (é o caso da rejeição, que funciona como teto de aprovação).
 */

export const ATTRIBUTES = [
  {
    id: 'carisma',
    nome: 'Carisma',
    curto: 'CAR',
    descricao: 'Conexão emocional com o eleitor e performance em TV.',
    inverted: false,
  },
  {
    id: 'gestao',
    nome: 'Gestão',
    curto: 'GES',
    descricao: 'Capacidade de administrar crise, orçamento e máquina pública.',
    inverted: false,
  },
  {
    id: 'base_fiel',
    nome: 'Base fiel',
    curto: 'BAS',
    descricao: 'Eleitorado que não abandona nem no pior momento da campanha.',
    inverted: false,
  },
  {
    id: 'rejeicao',
    nome: 'Rejeição',
    curto: 'REJ',
    descricao: 'Teto eleitoral. Quanto maior, menor o máximo que você alcança.',
    inverted: true,
  },
  {
    id: 'rede_aliados',
    nome: 'Rede de aliados',
    curto: 'RED',
    descricao: 'Facilidade de montar e segurar uma coligação ampla.',
    inverted: false,
  },
  {
    id: 'resiliencia_imagem',
    nome: 'Resiliência de imagem',
    curto: 'RES',
    descricao: 'Resistência a escândalo, fake news e desgaste de mídia.',
    inverted: false,
  },
  {
    id: 'discurso_economico',
    nome: 'Discurso econômico',
    curto: 'ECO',
    descricao: 'Peso junto a eleitorado de renda alta, empresarial e produtivo.',
    inverted: false,
  },
  {
    id: 'discurso_social',
    nome: 'Discurso social',
    curto: 'SOC',
    descricao: 'Peso junto a eleitorado popular e beneficiário de programas sociais.',
    inverted: false,
  },
];

export const ATTRIBUTE_IDS = ATTRIBUTES.map((a) => a.id);

export const ATTRIBUTE_BY_ID = ATTRIBUTES.reduce((acc, a) => {
  acc[a.id] = a;
  return acc;
}, {});

/** Converte rejeição em "valor efetivo positivo" para médias/overall. */
export function effectiveValue(attrId, value) {
  return ATTRIBUTE_BY_ID[attrId]?.inverted ? 99 - value : value;
}
