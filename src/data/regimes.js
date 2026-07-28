/**
 * 5 sistemas econômico-políticos do Modo Regime.
 *
 * O rótulo principal é sempre genérico (o modelo, não o país). A referência
 * histórica aparece só no campo `inspiracao`, com finalidade educacional.
 * Nenhum líder, partido histórico ou símbolo real é nomeado.
 *
 * Todos os parâmetros de simulação ficam em `params` e são consumidos pelos
 * engines (`criticalityEngine`, `economyEngine`, `regimeEngine`).
 */

export const BUDGET_KEYS = ['educacao', 'saude', 'defesa', 'infraestrutura', 'propaganda'];

export const BUDGET_LABELS = {
  educacao: 'Educação',
  saude: 'Saúde',
  defesa: 'Defesa',
  infraestrutura: 'Infraestrutura',
  propaganda: 'Propaganda',
};

export const REGIMES = [
  {
    id: 'economia_planejada',
    nome: 'Economia Planejada',
    subtitulo: 'Metas centrais de produção por setor',
    inspiracao:
      'Inspirado no modelo soviético de planos quinquenais: o Estado define cotas setoriais e concentra investimento na indústria pesada.',
    mecanica:
      'A indústria pesada cresce rápido enquanto o orçamento estiver concentrado em infraestrutura, mas bens de consumo ficam escassos e a fome sobe mesmo com produção alta.',
    tradeoff: 'Crescimento industrial forte × escassez crônica de consumo',
    indicePrincipal: { id: 'capacidade_produtiva', nome: 'Capacidade produtiva' },
    acento: 'moss',
    // Posição do sistema no mesmo espectro dos segmentos populacionais.
    eixos: { economico: -90, costumes: 15 },
    params: {
      crescimentoIndustrial: 1.35,
      multiplicadorDescontentamento: 1.1,
      riscoGuerra: 0.5,
      repressaoBase: 45,
      propagandaMult: 1.0,
      desigualdadeBase: 18,
      escassezConsumo: 22,
      arrecadacaoBase: 110,
      eficienciaTributaria: 0.95,
      sensibilidadeInflacao: 0.55,
      impostoPadrao: 70,
      expansionista: false,
      expansaoForcada: 0,
      limiteTerritorioSeguro: 999,
      pesosFim: { revolucao: 45, golpe: 25, greve: 30 },
    },
  },
  {
    id: 'corporativismo_estatal',
    nome: 'Corporativismo Estatal',
    subtitulo: 'Estado e grandes empresas na mesma mesa',
    inspiracao:
      'Inspirado no corporativismo da Itália do entreguerras: sindicatos e patronato absorvidos pelo Estado, com propaganda como instrumento central de coesão.',
    mecanica:
      'Propaganda tem efeito ampliado e a mobilização é rápida, mas a dissidência reprimida não desaparece: ela se acumula como instabilidade latente que cobra a conta depois.',
    tradeoff: 'Coesão rápida × instabilidade acumulada',
    indicePrincipal: { id: 'poder_militar', nome: 'Poder militar' },
    acento: 'brass',
    // Posição do sistema no mesmo espectro dos segmentos populacionais.
    eixos: { economico: -20, costumes: -80 },
    params: {
      crescimentoIndustrial: 1.1,
      multiplicadorDescontentamento: 1.25,
      riscoGuerra: 1.0,
      repressaoBase: 58,
      propagandaMult: 1.6,
      desigualdadeBase: 34,
      escassezConsumo: 10,
      arrecadacaoBase: 112,
      eficienciaTributaria: 0.85,
      sensibilidadeInflacao: 0.75,
      impostoPadrao: 55,
      expansionista: true,
      expansaoForcada: 0.4,
      limiteTerritorioSeguro: 140,
      pesosFim: { revolucao: 25, golpe: 50, greve: 25 },
    },
  },
  {
    id: 'hipermilitarizacao',
    nome: 'Hipermilitarização Expansionista',
    subtitulo: 'Economia inteira subordinada à máquina de guerra',
    inspiracao:
      'Inspirado nos regimes expansionistas europeus dos anos 1930-40, cuja economia dependia de conquista contínua para se sustentar — o que historicamente terminou em colapso por sobre-extensão.',
    mecanica:
      'O poder militar cresce muito rápido e o território se expande sozinho a cada turno. Se o território ultrapassar o que a capacidade militar consegue sustentar, o colapso é automático.',
    tradeoff: 'Força militar imediata × colapso por sobre-extensão',
    indicePrincipal: { id: 'poder_militar', nome: 'Poder militar' },
    acento: 'alarm',
    // Posição do sistema no mesmo espectro dos segmentos populacionais.
    eixos: { economico: -10, costumes: -95 },
    params: {
      crescimentoIndustrial: 1.2,
      multiplicadorDescontentamento: 1.2,
      riscoGuerra: 1.8,
      repressaoBase: 55,
      propagandaMult: 1.45,
      desigualdadeBase: 30,
      escassezConsumo: 26,
      arrecadacaoBase: 117,
      eficienciaTributaria: 0.8,
      sensibilidadeInflacao: 0.75,
      impostoPadrao: 60,
      expansionista: true,
      expansaoForcada: 8,
      limiteTerritorioSeguro: 100,
      pesosFim: { revolucao: 20, golpe: 55, greve: 25 },
    },
  },
  {
    id: 'capitalismo_liberal',
    nome: 'Capitalismo Liberal',
    subtitulo: 'Mercado livre, Estado como árbitro',
    inspiracao:
      'Inspirado nas economias liberais de mercado do pós-guerra anglo-americano: intervenção restrita a imposto, juro e regulação mínima.',
    mecanica:
      'Cresce rápido e arrecada bem com imposto baixo, mas a desigualdade sobe sozinha a cada turno e a criticidade responde forte a qualquer choque externo.',
    tradeoff: 'Crescimento volátil × desigualdade crescente',
    indicePrincipal: { id: 'capacidade_produtiva', nome: 'Capacidade produtiva' },
    acento: 'graphite',
    // Posição do sistema no mesmo espectro dos segmentos populacionais.
    eixos: { economico: 85, costumes: 30 },
    params: {
      crescimentoIndustrial: 1.25,
      multiplicadorDescontentamento: 1.0,
      riscoGuerra: 0.6,
      repressaoBase: 18,
      propagandaMult: 0.7,
      desigualdadeBase: 42,
      desigualdadeDeriva: 2.4,
      escassezConsumo: 4,
      arrecadacaoBase: 84,
      eficienciaTributaria: 1.1,
      sensibilidadeInflacao: 0.6,
      impostoPadrao: 35,
      expansionista: false,
      expansaoForcada: 0,
      limiteTerritorioSeguro: 999,
      pesosFim: { revolucao: 30, golpe: 20, greve: 50 },
    },
  },
  {
    id: 'social_democracia',
    nome: 'Social-Democracia',
    subtitulo: 'Mercado com redistribuição pesada',
    inspiracao:
      'Inspirado nos Estados de bem-estar nórdicos do século XX: tributação alta, serviço público universal e concertação entre capital e trabalho.',
    mecanica:
      'Entrega social converte orçamento em queda permanente de criticidade com eficiência máxima. Em compensação, o crescimento é lento e o custo do sistema pressiona a inflação.',
    tradeoff: 'Estabilidade alta × crescimento lento',
    indicePrincipal: { id: 'capacidade_produtiva', nome: 'Capacidade produtiva' },
    acento: 'calm',
    // Posição do sistema no mesmo espectro dos segmentos populacionais.
    eixos: { economico: -45, costumes: 60 },
    params: {
      crescimentoIndustrial: 0.85,
      multiplicadorDescontentamento: 0.75,
      riscoGuerra: 0.3,
      repressaoBase: 10,
      propagandaMult: 0.6,
      desigualdadeBase: 12,
      escassezConsumo: 2,
      arrecadacaoBase: 102,
      eficienciaTributaria: 1.0,
      sensibilidadeInflacao: 0.7,
      impostoPadrao: 65,
      entregaSocialMult: 1.5,
      expansionista: false,
      expansaoForcada: 0,
      limiteTerritorioSeguro: 999,
      pesosFim: { revolucao: 20, golpe: 25, greve: 55 },
    },
  },
];

export const REGIME_BY_ID = REGIMES.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

/**
 * Dificuldades: mudam a ESTRUTURA do modo, não só os números.
 */
export const DIFFICULTIES = [
  {
    id: 'facil',
    nome: 'Fácil',
    resumo: 'Rodada curta, dois controles, 3 decisões.',
    descricao:
      'Você recebe um regime já montado e mexe só no eixo Defesa × Social. Três turnos e o resultado sai.',
    turnos: 3,
    slidersLiberados: ['defesa', 'social'],
    mostrarSegmentos: false,
    eventosAtivos: false,
    eventosEncadeados: false,
    overextension: false,
    multiplicadorCriticidade: 0.7,
  },
  {
    id: 'medio',
    nome: 'Médio',
    resumo: 'Orçamento completo e os 9 segmentos reagindo.',
    descricao:
      'Os cinco sliders liberados e o painel populacional aberto: dá para ver qual segmento está te abandonando antes de ser tarde.',
    turnos: 8,
    slidersLiberados: ['educacao', 'saude', 'defesa', 'infraestrutura', 'propaganda'],
    mostrarSegmentos: true,
    eventosAtivos: true,
    eventosEncadeados: false,
    overextension: false,
    multiplicadorCriticidade: 1.0,
  },
  {
    id: 'dificil',
    nome: 'Difícil',
    resumo: 'Um turno = um ano. Eventos em cadeia e colapso real.',
    descricao:
      'Simulação ano a ano até 25 anos. Eventos históricos disparam em cadeia e, em sistema expansionista, território além da capacidade militar significa colapso automático.',
    turnos: 25,
    slidersLiberados: ['educacao', 'saude', 'defesa', 'infraestrutura', 'propaganda'],
    mostrarSegmentos: true,
    eventosAtivos: true,
    eventosEncadeados: true,
    overextension: true,
    multiplicadorCriticidade: 1.25,
  },
];

export const DIFFICULTY_BY_ID = DIFFICULTIES.reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {});

/** Orçamento inicial padrão (soma 100). */
export const DEFAULT_BUDGET = {
  educacao: 20,
  saude: 20,
  defesa: 20,
  infraestrutura: 25,
  propaganda: 15,
};
