/**
 * Eventos de campanha (Modo 1) e eventos históricos (Modo 2).
 *
 * Os eventos são DADOS: descrevem parâmetros de impacto, e quem aplica é o
 * engine (`eventEngine.js` / `regimeEngine.js`). Nenhum evento aqui cita
 * fato, ano, instituição ou pessoa real.
 *
 * Esquema de evento de campanha:
 *  - `base`: impacto base aplicado a todos os segmentos (negativo = ruim).
 *  - `modulador`: atributo que altera a intensidade.
 *      direcao 'mitiga'  -> atributo alto reduz o estrago
 *      direcao 'agrava'  -> atributo BAIXO aumenta o estrago
 *      direcao 'amplifica' -> atributo alto aumenta o ganho (eventos bons)
 *  - `porSegmento`: multiplicador por segmento (1 = padrão).
 *  - `efeitos`: alterações persistentes (rejeição, rede de aliados, coligação).
 *  - `gatilho`: condição obrigatória para o evento poder sortear.
 */

export const CAMPAIGN_EVENTS = [
  {
    id: 'escandalo_corrupcao',
    nome: 'Escândalo de corrupção',
    categoria: 'crise',
    manchete: 'Reportagem liga a campanha a contrato suspeito de publicidade',
    texto:
      'Uma investigação publicada no fim da tarde aponta pagamento irregular a uma empresa de marketing ligada ao seu comitê. A campanha nega, mas o assunto domina o noticiário por três dias.',
    peso: 26,
    base: -9,
    modulador: { atributo: 'resiliencia_imagem', direcao: 'mitiga', forca: 0.85 },
    porSegmento: {
      centro_indeciso: 1.5,
      classe_media_empresarial: 1.3,
      jovem_universitario: 1.2,
      evangelico: 1.1,
      esquerda_urbana: 0.7,
      direita_conservadora: 0.7,
      nordeste_popular: 0.6,
    },
    efeitos: { rejeicaoDelta: 4 },
  },
  {
    id: 'crise_economica',
    nome: 'Crise econômica',
    categoria: 'crise',
    manchete: 'Câmbio dispara e desemprego volta a subir no trimestre',
    texto:
      'Um choque externo derruba a bolsa e trava o crédito. A pergunta que a imprensa repete o dia inteiro é se você tem competência para administrar isso.',
    peso: 24,
    base: -8,
    modulador: { atributo: 'gestao', direcao: 'agrava', forca: 1.0 },
    porSegmento: {
      classe_media_empresarial: 1.6,
      agro: 1.4,
      sul_sudeste_industrial: 1.3,
      centro_indeciso: 1.2,
      nordeste_popular: 1.0,
      esquerda_urbana: 0.8,
      jovem_universitario: 0.9,
    },
    efeitos: {},
  },
  {
    id: 'fake_news_viral',
    nome: 'Fake news viral',
    categoria: 'crise',
    manchete: 'Vídeo editado do candidato viraliza em grupos de mensagem',
    texto:
      'Um trecho de fala fora de contexto circula em milhões de celulares até de madrugada. O desmentido chega, mas chega depois.',
    peso: 28,
    base: -7,
    modulador: { atributo: 'resiliencia_imagem', direcao: 'mitiga', forca: 1.15 },
    porSegmento: {
      evangelico: 1.5,
      nordeste_popular: 1.3,
      direita_conservadora: 1.2,
      centro_indeciso: 1.2,
      jovem_universitario: 0.8,
      classe_media_empresarial: 0.9,
      esquerda_urbana: 0.7,
    },
    efeitos: { rejeicaoDelta: 2 },
  },
  {
    id: 'traicao_de_aliado',
    nome: 'Traição de aliado',
    categoria: 'coligacao',
    manchete: 'Partido da base ameaça deixar a coligação',
    texto:
      'Com a campanha em queda, a bancada de um aliado se reúne às pressas e decide reavaliar o apoio. O palanque encolhe no meio do horário eleitoral.',
    peso: 30,
    base: -4,
    modulador: { atributo: 'rede_aliados', direcao: 'mitiga', forca: 0.9 },
    porSegmento: {
      centro_indeciso: 1.4,
      classe_media_empresarial: 1.1,
      sul_sudeste_industrial: 1.1,
    },
    efeitos: { removerAliado: true, redeAliadosDelta: -8 },
    gatilho: { tipo: 'aprovacao_abaixo', limiar: 35 },
  },
  {
    id: 'onda_organica',
    nome: 'Onda orgânica nas redes',
    categoria: 'impulso',
    manchete: 'Corte de entrevista do candidato explode em compartilhamentos',
    texto:
      'Um trecho de trinta segundos, sem produção nenhuma, cai no gosto da internet e domina o feed por dois dias. A campanha não gastou um real nisso.',
    peso: 20,
    base: 6,
    modulador: { atributo: 'carisma', direcao: 'amplifica', forca: 0.9 },
    porSegmento: {
      jovem_universitario: 1.6,
      centro_indeciso: 1.3,
      nordeste_popular: 1.1,
      esquerda_urbana: 1.0,
      agro: 0.7,
      evangelico: 0.8,
    },
    efeitos: {},
  },
  {
    id: 'apoio_de_categoria',
    nome: 'Apoio de categoria organizada',
    categoria: 'impulso',
    manchete: 'Federação de entidades anuncia apoio formal à candidatura',
    texto:
      'Depois de semanas de negociação, uma federação com capilaridade nacional formaliza o apoio e libera estrutura para o segundo turno.',
    peso: 16,
    base: 5,
    modulador: { atributo: 'rede_aliados', direcao: 'amplifica', forca: 0.8 },
    porSegmento: {
      sul_sudeste_industrial: 1.5,
      classe_media_empresarial: 1.3,
      agro: 1.2,
      centro_indeciso: 1.1,
      jovem_universitario: 0.6,
    },
    efeitos: { redeAliadosDelta: 4 },
  },
];

export const CAMPAIGN_EVENT_BY_ID = CAMPAIGN_EVENTS.reduce((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});

/**
 * Eventos históricos do Modo Regime (usados sobretudo na dificuldade Difícil,
 * onde disparam em cadeia). São situações genéricas de qualquer regime do
 * século XX: clima, doença, guerra, revolta e descoberta de recurso.
 *
 *  - `efeitos`: deltas aplicados ao estado do regime.
 *  - `encadeia`: ids de eventos que ficam mais prováveis nos turnos seguintes.
 */
export const REGIME_EVENTS = [
  {
    id: 'seca',
    nome: 'Seca prolongada',
    icone: '☀',
    texto:
      'Duas safras seguidas se perdem na região produtora. Os silos do Estado esvaziam antes do previsto e o pão racionado vira assunto de fila.',
    peso: 22,
    efeitos: { fome: 22, criticidade: 4, producao: -10, inflacao: 3 },
    encadeia: ['revolta_popular', 'peste'],
  },
  {
    id: 'peste',
    nome: 'Surto epidêmico',
    icone: '☣',
    texto:
      'Uma epidemia se espalha pelos centros urbanos. Hospitais sem verba viram notícia, e a capacidade de trabalho das fábricas despenca.',
    peso: 16,
    efeitos: { criticidade: 8, producao: -14, saudeDemanda: 15 },
    encadeia: ['revolta_popular'],
  },
  {
    id: 'guerra_externa',
    nome: 'Guerra externa',
    icone: '⚔',
    texto:
      'Uma disputa de fronteira escala para conflito aberto. A mobilização começa entusiasmada e fica cara muito rápido.',
    peso: 18,
    efeitos: { guerra: 1, criticidade: 3, inflacao: 6, poderMilitar: 8, producao: -6 },
    encadeia: ['revolta_popular', 'boom_recurso'],
  },
  {
    id: 'revolta_popular',
    nome: 'Revolta popular',
    icone: '✊',
    texto:
      'Greve de transporte vira ocupação de praça em três capitais. A resposta do governo nas próximas horas define o tamanho disso.',
    peso: 20,
    efeitos: { criticidade: 12, producao: -8, repressaoPressao: 10 },
    encadeia: ['golpe_iminente'],
  },
  {
    id: 'boom_recurso',
    nome: 'Boom de recurso natural',
    icone: '⛏',
    texto:
      'Uma jazida de grande porte entra em operação. Divisa entrando, orgulho nacional em alta e uma tentação enorme de gastar tudo de uma vez.',
    peso: 14,
    efeitos: { criticidade: -6, producao: 18, arrecadacaoBonus: 14, desigualdade: 4 },
    encadeia: [],
  },
  {
    id: 'golpe_iminente',
    nome: 'Conspiração no alto comando',
    icone: '⚑',
    texto:
      'Oficiais de alta patente passam a se reunir sem convite do gabinete. Ninguém confirma nada, e é exatamente esse o problema.',
    peso: 10,
    efeitos: { criticidade: 6, riscoGolpe: 18 },
    encadeia: [],
  },
];

export const REGIME_EVENT_BY_ID = REGIME_EVENTS.reduce((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});
