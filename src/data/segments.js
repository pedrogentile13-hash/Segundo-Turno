/**
 * 9 segmentos eleitorais fictícios (recortes sociológicos genéricos, não
 * institutos ou grupos reais identificáveis).
 *
 * Campos:
 *  - `peso`: tamanho populacional fictício. A soma dá 1.0 e é usada para
 *    ponderar a aprovação geral.
 *  - `eixos`: posição ideológica "ideal" do segmento (-100 a 100).
 *  - `pesoIdeologico`: o quanto esse segmento vota por ideologia. Centro
 *    indeciso é baixo (vota por humor/carisma), militância é alto.
 *  - `afinidades`: quanto cada atributo do candidato pesa nesse segmento.
 *    Valores de 0 a 1; podem ser negativos quando o atributo afasta o grupo.
 *  - `sensibilidadeRejeicao`: multiplicador da penalidade de rejeição.
 *  - `volatilidade`: multiplicador do impacto de eventos e debates.
 *  - `reacaoOrcamento`: usado só no Modo Regime. Diz como o segmento reage a
 *    cada ponto percentual de orçamento acima/abaixo do padrão.
 */

export const SEGMENTS = [
  {
    id: 'esquerda_urbana',
    nome: 'Esquerda urbana',
    curto: 'ESQ',
    descricao: 'Servidores, professores e militância de capital. Vota por programa e por memória de governo.',
    peso: 0.11,
    eixos: { economico: -72, costumes: 70 },
    pesoIdeologico: 0.95,
    base: 45,
    afinidades: {
      discurso_social: 0.9,
      base_fiel: 0.5,
      resiliencia_imagem: 0.3,
      carisma: 0.35,
      discurso_economico: -0.3,
      gestao: 0.15,
    },
    sensibilidadeRejeicao: 0.7,
    volatilidade: 0.75,
    reacaoOrcamento: { educacao: 0.9, saude: 0.8, defesa: -0.7, infraestrutura: 0.3, propaganda: -0.4 },

  },
  {
    id: 'direita_conservadora',
    nome: 'Direita conservadora',
    curto: 'DIR',
    descricao: 'Eleitor de ordem, propriedade e costumes tradicionais. Alta lealdade, baixa tolerância a ambiguidade.',
    peso: 0.13,
    eixos: { economico: 55, costumes: -78 },
    pesoIdeologico: 0.95,
    base: 45,
    afinidades: {
      base_fiel: 0.8,
      carisma: 0.4,
      discurso_economico: 0.45,
      resiliencia_imagem: 0.3,
      discurso_social: -0.35,
      gestao: 0.2,
    },
    sensibilidadeRejeicao: 0.65,
    volatilidade: 0.7,
    reacaoOrcamento: { educacao: 0.1, saude: 0.2, defesa: 0.9, infraestrutura: 0.4, propaganda: 0.3 },

  },
  {
    id: 'centro_indeciso',
    nome: 'Centro indeciso',
    curto: 'CEN',
    descricao: 'Decide na última semana. Rejeita extremos, pune escândalo e responde muito a desempenho de TV.',
    peso: 0.18,
    eixos: { economico: 5, costumes: 0 },
    pesoIdeologico: 0.3,
    base: 49,
    afinidades: {
      carisma: 0.75,
      gestao: 0.7,
      resiliencia_imagem: 0.45,
      rede_aliados: 0.25,
      base_fiel: 0.05,
    },
    sensibilidadeRejeicao: 1.4,
    volatilidade: 1.5,
    reacaoOrcamento: { educacao: 0.5, saude: 0.7, defesa: 0.2, infraestrutura: 0.6, propaganda: -0.1 },

  },
  {
    id: 'agro',
    nome: 'Agronegócio',
    curto: 'AGR',
    descricao: 'Produtores e cadeia do interior. Vota em crédito, câmbio, licenciamento e previsibilidade.',
    peso: 0.08,
    eixos: { economico: 72, costumes: -55 },
    pesoIdeologico: 0.8,
    base: 47,
    afinidades: {
      discurso_economico: 0.9,
      gestao: 0.5,
      rede_aliados: 0.3,
      base_fiel: 0.25,
      discurso_social: -0.3,
    },
    sensibilidadeRejeicao: 0.8,
    volatilidade: 0.85,
    reacaoOrcamento: { educacao: 0.1, saude: 0.2, defesa: 0.4, infraestrutura: 1, propaganda: 0 },

  },
  {
    id: 'evangelico',
    nome: 'Eleitorado evangélico',
    curto: 'EVA',
    descricao: 'Rede comunitária forte, pauta de costumes acima de pauta econômica. Comunicação capilar por liderança local.',
    peso: 0.14,
    eixos: { economico: 20, costumes: -82 },
    pesoIdeologico: 0.85,
    base: 46,
    afinidades: {
      base_fiel: 0.7,
      carisma: 0.5,
      rede_aliados: 0.45,
      discurso_social: 0.3,
      resiliencia_imagem: 0.25,
    },
    sensibilidadeRejeicao: 0.9,
    volatilidade: 1.0,
    reacaoOrcamento: { educacao: 0.4, saude: 0.6, defesa: 0.5, infraestrutura: 0.3, propaganda: 0.4 },

  },
  {
    id: 'jovem_universitario',
    nome: 'Jovem universitário',
    curto: 'JOV',
    descricao: 'Alta adesão a pauta progressista, baixa fidelidade e altíssima exposição a viral. Some quando se decepciona.',
    peso: 0.09,
    eixos: { economico: -45, costumes: 88 },
    pesoIdeologico: 0.85,
    base: 48,
    afinidades: {
      discurso_social: 0.7,
      carisma: 0.55,
      resiliencia_imagem: 0.4,
      discurso_economico: -0.25,
      base_fiel: -0.1,
    },
    sensibilidadeRejeicao: 1.1,
    volatilidade: 1.6,
    reacaoOrcamento: { educacao: 1.1, saude: 0.4, defesa: -0.9, infraestrutura: 0.2, propaganda: -0.6 },

  },
  {
    id: 'classe_media_empresarial',
    nome: 'Classe média empresarial',
    curto: 'EMP',
    descricao: 'Pequeno e médio empresário urbano. Sensível a imposto, juro e discurso de competência técnica.',
    peso: 0.1,
    eixos: { economico: 68, costumes: 10 },
    pesoIdeologico: 0.65,
    base: 48,
    afinidades: {
      discurso_economico: 0.85,
      gestao: 0.75,
      resiliencia_imagem: 0.2,
      discurso_social: -0.2,
    },
    sensibilidadeRejeicao: 1.15,
    volatilidade: 1.1,
    reacaoOrcamento: { educacao: 0.3, saude: 0.2, defesa: 0.3, infraestrutura: 0.9, propaganda: -0.3 },

  },
  {
    id: 'nordeste_popular',
    nome: 'Nordeste popular',
    curto: 'NEP',
    descricao: 'Eleitorado de baixa renda com memória direta de política pública. Alta fidelidade quando conquistado.',
    peso: 0.12,
    eixos: { economico: -58, costumes: -10 },
    pesoIdeologico: 0.7,
    base: 47,
    afinidades: {
      discurso_social: 0.95,
      base_fiel: 0.6,
      carisma: 0.45,
      discurso_economico: -0.25,
    },
    sensibilidadeRejeicao: 0.6,
    volatilidade: 0.8,
    reacaoOrcamento: { educacao: 0.6, saude: 1, defesa: -0.2, infraestrutura: 0.7, propaganda: 0.2 },

  },
  {
    id: 'sul_sudeste_industrial',
    nome: 'Sul-sudeste industrial',
    curto: 'IND',
    descricao: 'Cinturão fabril e sindical de renda média. Divide-se entre pauta de emprego e pauta de custo de vida.',
    peso: 0.05,
    eixos: { economico: -15, costumes: -20 },
    pesoIdeologico: 0.6,
    base: 48,
    afinidades: {
      gestao: 0.6,
      discurso_social: 0.5,
      discurso_economico: 0.35,
      rede_aliados: 0.2,
      base_fiel: 0.2,
    },
    sensibilidadeRejeicao: 1.0,
    volatilidade: 1.0,
    reacaoOrcamento: { educacao: 0.5, saude: 0.5, defesa: 0.2, infraestrutura: 1, propaganda: 0 },

  },
];

export const SEGMENT_IDS = SEGMENTS.map((s) => s.id);

export const SEGMENT_BY_ID = SEGMENTS.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {});

/** Soma dos pesos, exposta para o teste de sanidade do engine. */
export const TOTAL_SEGMENT_WEIGHT = SEGMENTS.reduce((sum, s) => sum + s.peso, 0);
