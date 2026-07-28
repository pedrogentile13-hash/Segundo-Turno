/**
 * 3 emissoras de debate FICTÍCIAS.
 *
 * Não são paródias de marcas existentes: são perfis editoriais genéricos
 * (a emissora de establishment, a popularesca de auditório e a de nicho
 * conservador) com nomes, slogans e apresentadores inventados.
 *
 * Sistema de tom:
 *  - toda opção de resposta tem um `tom` entre: tecnico, emocional, valores,
 *    conciliador, confronto.
 *  - cada emissora tem `tonsBonus` (o que a linha editorial premia) e
 *    `tonsGafe` (o que gera "gafe viral": penalidade extra espalhada nos
 *    segmentos que assistem àquele canal).
 */

export const TONES = {
  tecnico: { id: 'tecnico', nome: 'Técnico', descricao: 'Número, plano e detalhe de execução.' },
  emocional: { id: 'emocional', nome: 'Emocional', descricao: 'História, indignação, frase de efeito.' },
  valores: { id: 'valores', nome: 'Valores', descricao: 'Princípio, tradição, comunidade.' },
  conciliador: { id: 'conciliador', nome: 'Conciliador', descricao: 'Ponte, acordo, "todos os lados".' },
  confronto: { id: 'confronto', nome: 'Confronto', descricao: 'Ataque direto ao adversário ou à mídia.' },
};

/** Resposta usada quando o timer estoura: neutra e fraca de propósito. */
export const TIMEOUT_ANSWER = {
  id: 'timeout',
  texto: '(silêncio no ar — o candidato deixa o tempo acabar)',
  tom: 'conciliador',
  impactos: {
    centro_indeciso: -4,
    jovem_universitario: -3,
    classe_media_empresarial: -2,
    esquerda_urbana: -1,
    direita_conservadora: -1,
  },
  timeout: true,
};

export const DEBATE_TIMER_SECONDS = 10;

export const BROADCASTERS = [
  {
    id: 'rede_central',
    nome: 'Rede Central',
    slogan: 'O país informado.',
    apresentador: 'Helena Braga',
    perfil: 'Mainstream / estabelecimento',
    descricao:
      'Estúdio frio, cronômetro visível e mediação dura. Premia quem apresenta plano e desmonta quem parte para o grito.',
    tonsBonus: ['tecnico', 'conciliador'],
    tonsGafe: ['confronto', 'emocional'],
    multiplicador: 1.0,
    gafePenalidade: 5,
    // Peso da audiência: quem realmente assiste a esse debate.
    audiencia: {
      centro_indeciso: 1.0,
      classe_media_empresarial: 0.9,
      sul_sudeste_industrial: 0.8,
      esquerda_urbana: 0.7,
      direita_conservadora: 0.6,
      agro: 0.6,
      jovem_universitario: 0.5,
      evangelico: 0.4,
      nordeste_popular: 0.4,
    },
    perguntas: [
      {
        id: 'rc_fiscal',
        tema: 'Contas públicas',
        texto: 'O país fecha o ano com déficit pelo quinto exercício seguido. Corta gasto, aumenta imposto, ou nenhuma das duas?',
        opcoes: [
          {
            id: 'a',
            texto: 'Apresento uma regra de despesa com meta anual e revisão de gastos tributários no primeiro semestre.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 6, centro_indeciso: 5, agro: 3, esquerda_urbana: -2, nordeste_popular: -2 },
          },
          {
            id: 'b',
            texto: 'Não corto um centavo do social. O ajuste sai de quem nunca pagou a conta.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, esquerda_urbana: 5, classe_media_empresarial: -5, agro: -4, centro_indeciso: -1 },
          },
          {
            id: 'c',
            texto: 'Chamo governadores e o Congresso para um pacto fiscal de três anos, sem vencedor e sem derrotado.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 5, sul_sudeste_industrial: 3, classe_media_empresarial: 2, jovem_universitario: -1 },
          },
          {
            id: 'd',
            texto: 'O déficit é invenção de quem quer justificar privatização. A pergunta já vem torta.',
            tom: 'confronto',
            impactos: { esquerda_urbana: 4, centro_indeciso: -5, classe_media_empresarial: -6, agro: -3 },
          },
        ],
      },
      {
        id: 'rc_saude',
        tema: 'Saúde',
        texto: 'A fila de cirurgia eletiva bateu recorde. Qual é a sua primeira medida no dia um?',
        opcoes: [
          {
            id: 'a',
            texto: 'Mutirão nacional com meta por região e repasse condicionado a resultado auditado.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 6, sul_sudeste_industrial: 4, classe_media_empresarial: 3, nordeste_popular: 3 },
          },
          {
            id: 'b',
            texto: 'Já perdi gente na minha família nessa fila. Isso aqui não é estatística, é abandono.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, evangelico: 4, esquerda_urbana: 3, classe_media_empresarial: -2 },
          },
          {
            id: 'c',
            texto: 'Convoco público e privado na mesma mesa: quem tem leito ocioso entra no mutirão.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 4, classe_media_empresarial: 5, esquerda_urbana: -3, sul_sudeste_industrial: 2 },
          },
          {
            id: 'd',
            texto: 'A fila tem nome e sobrenome: é a gestão que está aí. Vou apurar cada contrato.',
            tom: 'confronto',
            impactos: { direita_conservadora: 3, centro_indeciso: -3, esquerda_urbana: -2, jovem_universitario: 1 },
          },
        ],
      },
      {
        id: 'rc_seguranca',
        tema: 'Segurança pública',
        texto: 'Homicídio cai nas capitais e sobe no interior. O que muda na sua política de segurança?',
        opcoes: [
          {
            id: 'a',
            texto: 'Integração de dados entre estados e financiamento por redução de indicador, não por efetivo.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 5, classe_media_empresarial: 4, agro: 4, sul_sudeste_industrial: 2 },
          },
          {
            id: 'b',
            texto: 'Segurança começa com emprego e escola em período integral. Polícia sozinha não resolve.',
            tom: 'conciliador',
            impactos: { esquerda_urbana: 5, jovem_universitario: 5, nordeste_popular: 3, direita_conservadora: -4, agro: -2 },
          },
          {
            id: 'c',
            texto: 'Autoridade e respaldo legal para quem está na ponta, com regra clara de uso da força.',
            tom: 'valores',
            impactos: { direita_conservadora: 6, evangelico: 4, agro: 3, jovem_universitario: -5, esquerda_urbana: -5 },
          },
          {
            id: 'd',
            texto: 'Bandido bom é bandido preso e a imprensa que romantiza isso vai ter que explicar.',
            tom: 'confronto',
            impactos: { direita_conservadora: 5, centro_indeciso: -4, jovem_universitario: -6, esquerda_urbana: -5 },
          },
        ],
      },
      {
        id: 'rc_ambiente',
        tema: 'Meio ambiente e produção',
        texto: 'Como conciliar meta ambiental internacional com a expansão da produção no interior?',
        opcoes: [
          {
            id: 'a',
            texto: 'Rastreabilidade da cadeia e crédito barato para quem regulariza. Fiscalização vira dado, não blitz.',
            tom: 'tecnico',
            impactos: { agro: 5, centro_indeciso: 4, classe_media_empresarial: 4, jovem_universitario: 2 },
          },
          {
            id: 'b',
            texto: 'Não existe economia forte em país devastado. Ponto final.',
            tom: 'valores',
            impactos: { jovem_universitario: 6, esquerda_urbana: 5, agro: -6, classe_media_empresarial: -2 },
          },
          {
            id: 'c',
            texto: 'Sento com produtor e com ambientalista na mesma sala e saio de lá com um cronograma assinado.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 5, agro: 2, jovem_universitario: 2, sul_sudeste_industrial: 2 },
          },
          {
            id: 'd',
            texto: 'Não vou aceitar meta ditada de fora por quem já derrubou a floresta deles.',
            tom: 'confronto',
            impactos: { agro: 5, direita_conservadora: 4, jovem_universitario: -6, centro_indeciso: -3, esquerda_urbana: -4 },
          },
        ],
      },
      {
        id: 'rc_educacao',
        tema: 'Educação',
        texto: 'O desempenho em leitura estagnou há uma década. O que o senhor(a) faz de diferente?',
        opcoes: [
          {
            id: 'a',
            texto: 'Alfabetização na idade certa como meta única do primeiro mandato, com avaliação censitária anual.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 6, classe_media_empresarial: 4, sul_sudeste_industrial: 3, nordeste_popular: 3 },
          },
          {
            id: 'b',
            texto: 'Professor que ganha mal ensina mal. Começo pelo piso e pela carreira.',
            tom: 'emocional',
            impactos: { esquerda_urbana: 6, sul_sudeste_industrial: 4, jovem_universitario: 3, classe_media_empresarial: -3 },
          },
          {
            id: 'c',
            texto: 'Escola é extensão da família. Currículo se decide com os pais na mesa, não só com especialista.',
            tom: 'valores',
            impactos: { evangelico: 6, direita_conservadora: 5, jovem_universitario: -4, esquerda_urbana: -4 },
          },
          {
            id: 'd',
            texto: 'Faço um pacto federativo de educação com todos os governadores, independente de partido.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 4, sul_sudeste_industrial: 3, agro: 2, nordeste_popular: 2 },
          },
        ],
      },
      {
        id: 'rc_instituicoes',
        tema: 'Instituições',
        texto: 'O senhor(a) se compromete a respeitar decisão judicial contrária ao seu governo?',
        opcoes: [
          {
            id: 'a',
            texto: 'Cumpro e recorro pelos meios previstos. É assim que funciona e é assim que vai ser.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 7, classe_media_empresarial: 5, esquerda_urbana: 3, sul_sudeste_industrial: 3 },
          },
          {
            id: 'b',
            texto: 'Cumpro, e ainda chamo os outros Poderes para reduzir o atrito que trava o país.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 6, classe_media_empresarial: 3, agro: 2, esquerda_urbana: 2 },
          },
          {
            id: 'c',
            texto: 'Cumpro decisão legítima. Agora, decisão que atropela o voto popular eu vou contestar todo dia.',
            tom: 'confronto',
            impactos: { direita_conservadora: 6, evangelico: 3, centro_indeciso: -6, classe_media_empresarial: -5 },
          },
          {
            id: 'd',
            texto: 'Minha lealdade é com quem me elegeu, e nenhum gabinete vai passar por cima disso.',
            tom: 'emocional',
            impactos: { direita_conservadora: 5, nordeste_popular: 2, centro_indeciso: -7, classe_media_empresarial: -6 },
          },
        ],
      },
      {
        id: 'rc_imposto',
        tema: 'Reforma tributária',
        texto: 'O senhor(a) aumentaria imposto sobre alta renda para bancar a redução no consumo?',
        opcoes: [
          {
            id: 'a',
            texto: 'Aumento, com faixa clara e regra de transição publicada antes da posse.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 5, nordeste_popular: 5, sul_sudeste_industrial: 4, classe_media_empresarial: -4, agro: -3 },
          },
          {
            id: 'b',
            texto: 'Não aumento nada. Simplifico o sistema e a arrecadação vem do crescimento.',
            tom: 'conciliador',
            impactos: { classe_media_empresarial: 6, agro: 5, centro_indeciso: 3, esquerda_urbana: -3 },
          },
          {
            id: 'c',
            texto: 'Quem ganha mais tem que pagar mais. Isso não é ideologia, é conta de padaria.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, esquerda_urbana: 5, classe_media_empresarial: -5, agro: -4, centro_indeciso: -1 },
          },
          {
            id: 'd',
            texto: 'Vou apresentar o desenho completo e submeter ao Congresso sem chantagem dos dois lados.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 5, classe_media_empresarial: 2, sul_sudeste_industrial: 3 },
          },
        ],
      },
      {
        id: 'rc_energia',
        tema: 'Energia e tarifa',
        texto: 'A conta de luz subiu acima da inflação por três anos seguidos. O que muda?',
        opcoes: [
          {
            id: 'a',
            texto: 'Revejo os contratos herdados e mudo a regra de repasse tarifário. É contrato, não é dogma.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 5, sul_sudeste_industrial: 5, classe_media_empresarial: 4, nordeste_popular: 3 },
          },
          {
            id: 'b',
            texto: 'Tarifa social ampliada já, para quem não consegue pagar. O resto discute depois.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, esquerda_urbana: 4, classe_media_empresarial: -3 },
          },
          {
            id: 'c',
            texto: 'Investimento em geração distribuída, com marco regulatório estável para atrair capital.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 6, agro: 4, centro_indeciso: 3, jovem_universitario: 2 },
          },
          {
            id: 'd',
            texto: 'Alguém ficou rico com essa conta e não fui eu nem você. Vou abrir cada contrato.',
            tom: 'confronto',
            impactos: { nordeste_popular: 4, esquerda_urbana: 3, centro_indeciso: -3, classe_media_empresarial: -4 },
          },
        ],
      },
      {
        id: 'rc_reforma_adm',
        tema: 'Serviço público',
        texto: 'Reforma administrativa: corta privilégio ou desmonta carreira de Estado?',
        opcoes: [
          {
            id: 'a',
            texto: 'Corto supersalário e penduricalho, e protejo a carreira de quem entra por concurso.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 6, classe_media_empresarial: 5, esquerda_urbana: 2, sul_sudeste_industrial: 3 },
          },
          {
            id: 'b',
            texto: 'Servidor não é inimigo do país. Reforma que começa demonizando quem trabalha já nasce errada.',
            tom: 'emocional',
            impactos: { esquerda_urbana: 6, sul_sudeste_industrial: 4, classe_media_empresarial: -4, centro_indeciso: -2 },
          },
          {
            id: 'c',
            texto: 'Estado enxuto, avaliação de desempenho e fim da estabilidade automática.',
            tom: 'valores',
            impactos: { classe_media_empresarial: 6, agro: 4, direita_conservadora: 4, esquerda_urbana: -6 },
          },
          {
            id: 'd',
            texto: 'Construo isso com as próprias categorias na mesa. Reforma imposta não sobrevive ao mandato.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 4, sul_sudeste_industrial: 4, esquerda_urbana: 3 },
          },
        ],
      },
      {
        id: 'rc_habitacao',
        tema: 'Moradia',
        texto: 'O déficit habitacional não cai há uma década. Onde entra o seu governo?',
        opcoes: [
          {
            id: 'a',
            texto: 'Retomo financiamento de faixa baixa com meta física anual e fiscalização de entrega.',
            tom: 'tecnico',
            impactos: { nordeste_popular: 6, sul_sudeste_industrial: 5, centro_indeciso: 4, esquerda_urbana: 3 },
          },
          {
            id: 'b',
            texto: 'Regularizo o que já existe. Milhões de famílias moram há vinte anos num imóvel sem escritura.',
            tom: 'conciliador',
            impactos: { nordeste_popular: 5, direita_conservadora: 4, centro_indeciso: 4, classe_media_empresarial: 3 },
          },
          {
            id: 'c',
            texto: 'Casa própria é dignidade e é raiz de família. Não é gasto, é o alicerce de tudo.',
            tom: 'valores',
            impactos: { evangelico: 6, direita_conservadora: 4, nordeste_popular: 4, jovem_universitario: -2 },
          },
          {
            id: 'd',
            texto: 'Destravo licenciamento e crédito para o setor produzir. O Estado não precisa construir.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 6, agro: 3, esquerda_urbana: -4, nordeste_popular: -2 },
          },
        ],
      },
      {
        id: 'rc_tecnologia',
        tema: 'Plataformas e dados',
        texto: 'O país deve regular as grandes plataformas digitais?',
        opcoes: [
          {
            id: 'a',
            texto: 'Regulo com regra de transparência de algoritmo e responsabilidade sobre anúncio pago.',
            tom: 'tecnico',
            impactos: { jovem_universitario: 5, esquerda_urbana: 5, centro_indeciso: 4, direita_conservadora: -4 },
          },
          {
            id: 'b',
            texto: 'Regulação vira censura na mão errada. Prefiro punir crime já previsto em lei.',
            tom: 'valores',
            impactos: { direita_conservadora: 6, evangelico: 4, jovem_universitario: -4, esquerda_urbana: -4 },
          },
          {
            id: 'c',
            texto: 'Chamo plataformas, imprensa e sociedade civil para desenhar isso junto, sem atropelo.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 5, classe_media_empresarial: 3, jovem_universitario: 2 },
          },
          {
            id: 'd',
            texto: 'Essas empresas ganham fortuna aqui e não respondem a ninguém. Isso acaba comigo.',
            tom: 'confronto',
            impactos: { esquerda_urbana: 4, sul_sudeste_industrial: 2, classe_media_empresarial: -5, centro_indeciso: -3 },
          },
        ],
      },
    ],
  },

  {
    id: 'tv_pulso',
    nome: 'TV Pulso',
    slogan: 'A voz de quem acorda cedo.',
    apresentador: 'Dante Vilar',
    perfil: 'Popularesca / sensacionalista',
    descricao:
      'Auditório cheio, apresentador que interrompe e câmera colada no rosto. Aqui plano de governo não vende — frase de efeito vende.',
    tonsBonus: ['emocional', 'confronto'],
    tonsGafe: ['tecnico', 'conciliador'],
    multiplicador: 1.25,
    gafePenalidade: 6,
    audiencia: {
      nordeste_popular: 1.0,
      evangelico: 0.9,
      centro_indeciso: 0.9,
      direita_conservadora: 0.8,
      sul_sudeste_industrial: 0.7,
      jovem_universitario: 0.5,
      esquerda_urbana: 0.4,
      agro: 0.4,
      classe_media_empresarial: 0.3,
    },
    perguntas: [
      {
        id: 'tp_custo_vida',
        tema: 'Custo de vida',
        texto: 'Dante levanta a nota do mercado ao vivo: "o arroz subiu, a carne sumiu. O que o senhor(a) fala pra essa mãe aqui na plateia?"',
        opcoes: [
          {
            id: 'a',
            texto: 'Falo olhando pra ela: eu sei o que é escolher entre o gás e a carne. E isso vai acabar.',
            tom: 'emocional',
            impactos: { nordeste_popular: 8, evangelico: 5, sul_sudeste_industrial: 4, centro_indeciso: 3 },
          },
          {
            id: 'b',
            texto: 'A inflação de alimento tem causa cambial e climática. Ataco os dois com estoque regulador.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 4, agro: 3, centro_indeciso: 1, nordeste_popular: -2 },
          },
          {
            id: 'c',
            texto: 'Pergunta pra ela quem ganhou dinheiro com isso. Não foi o produtor e não foi ela.',
            tom: 'confronto',
            impactos: { nordeste_popular: 6, esquerda_urbana: 5, sul_sudeste_industrial: 3, agro: -4, classe_media_empresarial: -4 },
          },
          {
            id: 'd',
            texto: 'É um problema de todos, e vou reunir governo, indústria e varejo para resolver juntos.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 2, classe_media_empresarial: 2, nordeste_popular: -1 },
          },
        ],
      },
      {
        id: 'tp_corrupcao',
        tema: 'Corrupção',
        texto: '"Todo político rouba. Por que o senhor(a) seria diferente?"',
        opcoes: [
          {
            id: 'a',
            texto: 'Não seria. Por isso quero controle em cima de mim: portal aberto, contrato público, auditoria independente.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 5, classe_media_empresarial: 5, jovem_universitario: 3, nordeste_popular: -1 },
          },
          {
            id: 'b',
            texto: 'Minha vida está aberta. Quem tiver prova contra mim traz agora, ao vivo, nessa bancada.',
            tom: 'confronto',
            impactos: { direita_conservadora: 6, nordeste_popular: 5, centro_indeciso: 4, esquerda_urbana: 1 },
          },
          {
            id: 'c',
            texto: 'Eu venho de baixo. Se eu roubar, quem me julga primeiro é a minha própria rua.',
            tom: 'emocional',
            impactos: { nordeste_popular: 7, evangelico: 5, sul_sudeste_industrial: 3, classe_media_empresarial: -1 },
          },
          {
            id: 'd',
            texto: 'Generalizar assim é injusto com muita gente honesta que serve ao país.',
            tom: 'conciliador',
            impactos: { centro_indeciso: -2, direita_conservadora: -3, jovem_universitario: -2, esquerda_urbana: 1 },
          },
        ],
      },
      {
        id: 'tp_emprego',
        tema: 'Emprego',
        texto: '"Tem um moço aqui de 22 anos, entregador, sem carteira assinada há dois anos. O que o senhor(a) tem pra ele?"',
        opcoes: [
          {
            id: 'a',
            texto: 'Tenho proteção pra quem está na rua: seguro, contribuição e regra de aplicativo com o trabalhador na mesa.',
            tom: 'emocional',
            impactos: { jovem_universitario: 6, sul_sudeste_industrial: 5, nordeste_popular: 5, esquerda_urbana: 4, classe_media_empresarial: -3 },
          },
          {
            id: 'b',
            texto: 'Tenho desoneração da folha para o primeiro emprego e crédito para quem quer abrir o próprio negócio.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 6, agro: 3, centro_indeciso: 3, esquerda_urbana: -2 },
          },
          {
            id: 'c',
            texto: 'Trabalho é dignidade. Um país que deixa o jovem virar número perdeu o rumo moral.',
            tom: 'valores',
            impactos: { evangelico: 6, direita_conservadora: 4, nordeste_popular: 3, jovem_universitario: 1 },
          },
          {
            id: 'd',
            texto: 'Quem tirou o direito dele foi quem estava sentado nessa cadeira antes de mim. E eu vou nomear.',
            tom: 'confronto',
            impactos: { nordeste_popular: 5, direita_conservadora: 3, centro_indeciso: -2, classe_media_empresarial: -3 },
          },
        ],
      },
      {
        id: 'tp_seguranca',
        tema: 'Violência',
        texto: '"A plateia toda aqui já foi assaltada. Levanta a mão quem já. Viu? Fala pra eles."',
        opcoes: [
          {
            id: 'a',
            texto: 'Eu também já levantei essa mão. E cansei de ouvir promessa de político sobre isso.',
            tom: 'emocional',
            impactos: { direita_conservadora: 6, centro_indeciso: 5, evangelico: 4, nordeste_popular: 4 },
          },
          {
            id: 'b',
            texto: 'Vou apertar onde dói: rastreio de arma, asfixia financeira da facção e presídio federal para chefia.',
            tom: 'confronto',
            impactos: { direita_conservadora: 6, centro_indeciso: 4, agro: 3, jovem_universitario: -3 },
          },
          {
            id: 'c',
            texto: 'Prevenção com escola integral e iluminação pública reduz mais crime do que discurso de palanque.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 4, jovem_universitario: 4, centro_indeciso: 1, direita_conservadora: -4 },
          },
          {
            id: 'd',
            texto: 'Segurança não pode virar disputa. Chamo todos os governadores e faço um plano único.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 2, sul_sudeste_industrial: 2, direita_conservadora: -2 },
          },
        ],
      },
      {
        id: 'tp_pessoal',
        tema: 'Vida pessoal',
        texto: '"Deixa eu te perguntar uma coisa pessoal: qual foi a última vez que o senhor(a) chorou?"',
        opcoes: [
          {
            id: 'a',
            texto: 'Semana passada, num hospital do interior, vendo uma senhora esperar remédio que não chegou.',
            tom: 'emocional',
            impactos: { nordeste_popular: 7, evangelico: 6, centro_indeciso: 5, sul_sudeste_industrial: 3 },
          },
          {
            id: 'b',
            texto: 'Prefiro não trazer minha família para o palanque. Isso não é assunto de campanha.',
            tom: 'conciliador',
            impactos: { centro_indeciso: -3, nordeste_popular: -4, evangelico: -3, classe_media_empresarial: 2 },
          },
          {
            id: 'c',
            texto: 'Rezando. É a hora em que eu lembro que esse cargo é passageiro e a conta vem depois.',
            tom: 'valores',
            impactos: { evangelico: 8, direita_conservadora: 5, nordeste_popular: 4, jovem_universitario: -3, esquerda_urbana: -2 },
          },
          {
            id: 'd',
            texto: 'Não venho aqui pra dar espetáculo. Venho falar de plano de governo.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 3, centro_indeciso: -4, nordeste_popular: -5, evangelico: -4 },
          },
        ],
      },
      {
        id: 'tp_midia',
        tema: 'Imprensa',
        texto: '"Dizem por aí que o senhor(a) é fabricado pela imprensa grande. Responde aí, olhando pra câmera."',
        opcoes: [
          {
            id: 'a',
            texto: 'Fabricado? Eu apanhei de manchete a campanha inteira. Quem me fabricou foi rua, não redação.',
            tom: 'confronto',
            impactos: { direita_conservadora: 6, nordeste_popular: 5, centro_indeciso: 3, classe_media_empresarial: -2 },
          },
          {
            id: 'b',
            texto: 'Imprensa livre é o que impede que qualquer um de nós vire dono do país. Inclusive eu.',
            tom: 'valores',
            impactos: { esquerda_urbana: 5, centro_indeciso: 4, classe_media_empresarial: 4, jovem_universitario: 3, direita_conservadora: -3 },
          },
          {
            id: 'c',
            texto: 'Olha pra minha história, Dante. Ninguém fabrica trinta anos de vida em três meses de campanha.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, evangelico: 4, centro_indeciso: 4, sul_sudeste_industrial: 3 },
          },
          {
            id: 'd',
            texto: 'Não vou entrar nesse tipo de discussão. Prefiro voltar ao tema anterior.',
            tom: 'conciliador',
            impactos: { centro_indeciso: -4, direita_conservadora: -4, nordeste_popular: -3, jovem_universitario: -2 },
          },
        ],
      },
      {
        id: 'tp_fila_sus',
        tema: 'Saúde pública',
        texto: '"Essa senhora aqui acordou às três da manhã pra pegar ficha. Três da manhã! Olha pra ela e fala."',
        opcoes: [
          {
            id: 'a',
            texto: 'A senhora não devia estar aqui contando isso. Devia estar em casa, já atendida. Me desculpa por isso.',
            tom: 'emocional',
            impactos: { nordeste_popular: 8, evangelico: 6, centro_indeciso: 5, sul_sudeste_industrial: 3 },
          },
          {
            id: 'b',
            texto: 'Vou pôr agendamento eletrônico e regulação de vaga por gravidade, não por fila de madrugada.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 4, centro_indeciso: 3, nordeste_popular: -1 },
          },
          {
            id: 'c',
            texto: 'Enquanto ela pegava ficha às três, tinha gente assinando contrato superfaturado. Vou atrás.',
            tom: 'confronto',
            impactos: { nordeste_popular: 6, direita_conservadora: 5, centro_indeciso: 3, esquerda_urbana: 2 },
          },
          {
            id: 'd',
            texto: 'É um problema estrutural que envolve União, estados e municípios. Vou coordenar os três.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 1, nordeste_popular: -3, evangelico: -2 },
          },
        ],
      },
      {
        id: 'tp_aposentadoria',
        tema: 'Aposentadoria',
        texto: '"O senhor(a) mexe na aposentadoria de quem já está contribuindo há trinta anos? Responde sim ou não."',
        opcoes: [
          {
            id: 'a',
            texto: 'Não. Quem já contribuiu tem direito adquirido e comigo isso não se toca.',
            tom: 'emocional',
            impactos: { nordeste_popular: 7, sul_sudeste_industrial: 6, evangelico: 5, esquerda_urbana: 4, classe_media_empresarial: -3 },
          },
          {
            id: 'b',
            texto: 'Nenhuma regra vale para quem está na fila de chegada. Mudança só valeria daqui pra frente.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 5, centro_indeciso: 3, agro: 3, nordeste_popular: -2 },
          },
          {
            id: 'c',
            texto: 'Trabalhar a vida inteira e envelhecer sem sossego é uma vergonha para qualquer país.',
            tom: 'valores',
            impactos: { evangelico: 6, nordeste_popular: 5, direita_conservadora: 4, sul_sudeste_industrial: 3 },
          },
          {
            id: 'd',
            texto: 'Quem mexeu na sua aposentadoria já tem nome. Não fui eu e eu não vou repetir.',
            tom: 'confronto',
            impactos: { nordeste_popular: 6, sul_sudeste_industrial: 4, centro_indeciso: -2, classe_media_empresarial: -3 },
          },
        ],
      },
      {
        id: 'tp_promessa',
        tema: 'Promessa de campanha',
        texto: '"Faz uma promessa aqui, ao vivo, olhando pra câmera. E se não cumprir?"',
        opcoes: [
          {
            id: 'a',
            texto: 'Prometo uma só: se em dois anos a fila não cair, eu venho aqui de novo dar explicação.',
            tom: 'emocional',
            impactos: { nordeste_popular: 7, centro_indeciso: 6, evangelico: 5, sul_sudeste_industrial: 3 },
          },
          {
            id: 'b',
            texto: 'Não faço promessa de auditório. Faço meta publicada, com prazo e responsável.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 5, centro_indeciso: 2, nordeste_popular: -3, evangelico: -2 },
          },
          {
            id: 'c',
            texto: 'Prometo diante de Deus e dessa plateia que não vou trair quem confiou em mim.',
            tom: 'valores',
            impactos: { evangelico: 8, direita_conservadora: 5, nordeste_popular: 4, jovem_universitario: -4 },
          },
          {
            id: 'd',
            texto: 'Prometo que quem roubou vai devolver. E tem gente aqui que já sabe que eu falo sério.',
            tom: 'confronto',
            impactos: { direita_conservadora: 6, nordeste_popular: 4, centro_indeciso: -1, esquerda_urbana: -2 },
          },
        ],
      },
      {
        id: 'tp_transporte',
        tema: 'Transporte',
        texto: '"Quatro horas por dia dentro de um ônibus. É isso que essa plateia vive. Qual é a sua?"',
        opcoes: [
          {
            id: 'a',
            texto: 'Quatro horas por dia é um filho que você não vê crescer. Isso é roubo de vida.',
            tom: 'emocional',
            impactos: { sul_sudeste_industrial: 7, nordeste_popular: 6, centro_indeciso: 5, jovem_universitario: 4 },
          },
          {
            id: 'b',
            texto: 'Financio corredor de ônibus e trilho urbano com contrapartida de tarifa nos municípios.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 4, classe_media_empresarial: 4, sul_sudeste_industrial: 4 },
          },
          {
            id: 'c',
            texto: 'Passe livre para estudante e desempregado, e subsídio direto na tarifa.',
            tom: 'emocional',
            impactos: { jovem_universitario: 7, esquerda_urbana: 5, nordeste_popular: 4, classe_media_empresarial: -4 },
          },
          {
            id: 'd',
            texto: 'Isso é competência municipal. Não vou prometer o que não está na minha mão.',
            tom: 'conciliador',
            impactos: { classe_media_empresarial: 2, centro_indeciso: -4, nordeste_popular: -5, sul_sudeste_industrial: -4 },
          },
        ],
      },
      {
        id: 'tp_ataque',
        tema: 'Ataque do adversário',
        texto: '"Seu adversário disse essa semana que o senhor(a) é despreparado. Ele está aqui do outro lado da tela. Responde."',
        opcoes: [
          {
            id: 'a',
            texto: 'Despreparado é quem teve a chance e deixou o país nesse estado. Eu ainda nem comecei.',
            tom: 'confronto',
            impactos: { direita_conservadora: 6, nordeste_popular: 5, centro_indeciso: 3, esquerda_urbana: 2 },
          },
          {
            id: 'b',
            texto: 'Não vou responder ofensa com ofensa. Quem decide isso é quem está assistindo.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 2, classe_media_empresarial: 3, nordeste_popular: -3, direita_conservadora: -3 },
          },
          {
            id: 'c',
            texto: 'Ele tem razão numa coisa: eu não venho desse mundo. E é exatamente por isso que estou aqui.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, jovem_universitario: 5, centro_indeciso: 5, evangelico: 3 },
          },
          {
            id: 'd',
            texto: 'Preparo se mede em entrega. Comparo meu histórico com o dele linha por linha, quando ele quiser.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 5, centro_indeciso: 3, nordeste_popular: -2 },
          },
        ],
      },
    ],
  },

  {
    id: 'rede_alvorada',
    nome: 'Rede Alvorada',
    slogan: 'Valores que sustentam uma nação.',
    apresentador: 'Pastor-jornalista Elias Monte',
    perfil: 'Conservadora / costumes e família',
    descricao:
      'Bancada sóbria, tom respeitoso e perguntas sobre família, fé e comunidade. Ataque agressivo pega muito mal aqui.',
    tonsBonus: ['valores', 'conciliador'],
    tonsGafe: ['confronto', 'tecnico'],
    multiplicador: 1.1,
    gafePenalidade: 5,
    audiencia: {
      evangelico: 1.0,
      direita_conservadora: 0.95,
      nordeste_popular: 0.7,
      agro: 0.7,
      centro_indeciso: 0.6,
      sul_sudeste_industrial: 0.5,
      classe_media_empresarial: 0.4,
      jovem_universitario: 0.3,
      esquerda_urbana: 0.3,
    },
    perguntas: [
      {
        id: 'ra_familia',
        tema: 'Família',
        texto: 'Qual é o papel do Estado dentro da vida familiar?',
        opcoes: [
          {
            id: 'a',
            texto: 'Sustentar a família, nunca substituí-la. O Estado entra onde a família precisa de apoio, não onde ela decide.',
            tom: 'valores',
            impactos: { evangelico: 8, direita_conservadora: 6, agro: 3, nordeste_popular: 3, jovem_universitario: -4 },
          },
          {
            id: 'b',
            texto: 'O Estado tem que garantir creche, renda e escola. Sem isso, "valorizar a família" é só discurso.',
            tom: 'emocional',
            impactos: { esquerda_urbana: 5, nordeste_popular: 5, sul_sudeste_industrial: 3, evangelico: -2, direita_conservadora: -3 },
          },
          {
            id: 'c',
            texto: 'Existem muitos arranjos familiares e o Estado atende todos igualmente. Não é papel dele escolher um modelo.',
            tom: 'conciliador',
            impactos: { jovem_universitario: 6, esquerda_urbana: 5, centro_indeciso: 2, evangelico: -5, direita_conservadora: -4 },
          },
          {
            id: 'd',
            texto: 'Política de família se avalia por indicador: mortalidade infantil, evasão escolar e renda domiciliar.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 3, centro_indeciso: 2, evangelico: -2 },
          },
        ],
      },
      {
        id: 'ra_curriculo',
        tema: 'Escola e currículo',
        texto: 'Quem decide o que entra no currículo escolar dos filhos: o especialista ou os pais?',
        opcoes: [
          {
            id: 'a',
            texto: 'Os pais precisam ser ouvidos e ter transparência sobre o material. Confiança se constrói assim.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 6, agro: 3, jovem_universitario: -4, esquerda_urbana: -4 },
          },
          {
            id: 'b',
            texto: 'Currículo é decisão técnica, com base em evidência de aprendizagem. Ideologia atrapalha os dois lados.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 4, centro_indeciso: 3, esquerda_urbana: 1, evangelico: -3 },
          },
          {
            id: 'c',
            texto: 'Conselho escolar com pais, professores e estudantes decidindo junto. É o formato que funciona.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 4, evangelico: 3, sul_sudeste_industrial: 3, esquerda_urbana: 2 },
          },
          {
            id: 'd',
            texto: 'Não vou aceitar que grupo político use sala de aula como palanque. E eu sei exatamente quem faz isso.',
            tom: 'confronto',
            impactos: { direita_conservadora: 5, evangelico: 3, jovem_universitario: -6, esquerda_urbana: -6, centro_indeciso: -3 },
          },
        ],
      },
      {
        id: 'ra_assistencia',
        tema: 'Assistência social',
        texto: 'Comunidades religiosas fazem trabalho social onde o poder público não chega. Como o senhor(a) trata isso?',
        opcoes: [
          {
            id: 'a',
            texto: 'Reconheço, apoio e faço parceria com transparência. Quem está na ponta há trinta anos merece respeito.',
            tom: 'valores',
            impactos: { evangelico: 8, nordeste_popular: 5, direita_conservadora: 4, esquerda_urbana: -3 },
          },
          {
            id: 'b',
            texto: 'Parceria sim, com edital, prestação de contas e critério igual para qualquer entidade.',
            tom: 'tecnico',
            impactos: { centro_indeciso: 4, classe_media_empresarial: 4, evangelico: 1, esquerda_urbana: 2 },
          },
          {
            id: 'c',
            texto: 'O Estado é laico. Trabalho social é dever público, não pode depender de fé de ninguém.',
            tom: 'confronto',
            impactos: { esquerda_urbana: 5, jovem_universitario: 5, evangelico: -8, direita_conservadora: -5, nordeste_popular: -3 },
          },
          {
            id: 'd',
            texto: 'Ninguém precisa escolher entre Estado e comunidade. Trabalho junto com as duas mãos.',
            tom: 'conciliador',
            impactos: { evangelico: 5, centro_indeciso: 4, nordeste_popular: 3, sul_sudeste_industrial: 2 },
          },
        ],
      },
      {
        id: 'ra_drogas',
        tema: 'Política sobre drogas',
        texto: 'Tratamento, repressão ou os dois? E onde entra a comunidade terapêutica?',
        opcoes: [
          {
            id: 'a',
            texto: 'Os dois, com a comunidade terapêutica financiada e fiscalizada. Recuperação é caminho de volta, não favor.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 5, nordeste_popular: 3, jovem_universitario: -3 },
          },
          {
            id: 'b',
            texto: 'Trato como saúde pública, com redução de danos e leito psiquiátrico na rede.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 5, jovem_universitario: 5, centro_indeciso: 2, evangelico: -4, direita_conservadora: -4 },
          },
          {
            id: 'c',
            texto: 'Enquanto discutem teoria, a família enterra filho. Eu escolho começar por quem está morrendo hoje.',
            tom: 'emocional',
            impactos: { evangelico: 5, nordeste_popular: 5, direita_conservadora: 4, centro_indeciso: 3 },
          },
          {
            id: 'd',
            texto: 'Quem defende liberação é cúmplice do que acontece nas praças dessas cidades.',
            tom: 'confronto',
            impactos: { direita_conservadora: 5, evangelico: 2, jovem_universitario: -7, esquerda_urbana: -6, centro_indeciso: -4 },
          },
        ],
      },
      {
        id: 'ra_laicidade',
        tema: 'Estado e fé',
        texto: 'O senhor(a) governaria a partir da sua fé pessoal?',
        opcoes: [
          {
            id: 'a',
            texto: 'Minha fé forma o meu caráter e me cobra. Mas governo para todos, crentes e não crentes.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 4, centro_indeciso: 4, nordeste_popular: 3 },
          },
          {
            id: 'b',
            texto: 'Governo pela Constituição. Fé é assunto de foro íntimo e fica fora do despacho.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 4, jovem_universitario: 4, classe_media_empresarial: 3, evangelico: -4 },
          },
          {
            id: 'c',
            texto: 'Respeito todas as crenças e nenhuma vai ser perseguida nem privilegiada no meu governo.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 5, evangelico: 3, esquerda_urbana: 2, jovem_universitario: 2 },
          },
          {
            id: 'd',
            texto: 'Tem gente que só se incomoda com fé quando ela é a nossa. Já reparou nisso?',
            tom: 'confronto',
            impactos: { evangelico: 4, direita_conservadora: 4, jovem_universitario: -6, esquerda_urbana: -6, centro_indeciso: -4 },
          },
        ],
      },
      {
        id: 'ra_geracoes',
        tema: 'Idoso e cuidado',
        texto: 'O país está envelhecendo rápido. Quem cuida de quem cuidou da gente?',
        opcoes: [
          {
            id: 'a',
            texto: 'Cuidar dos pais é dever nosso, e o Estado tem que dar condição para a família fazer isso em casa.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 5, nordeste_popular: 4, agro: 2 },
          },
          {
            id: 'b',
            texto: 'Política nacional de cuidado com rede pública, cuidador formado e teto de custo para a família.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 4, sul_sudeste_industrial: 4, centro_indeciso: 4, classe_media_empresarial: 2 },
          },
          {
            id: 'c',
            texto: 'Minha avó me criou. Não vou permitir que idoso desse país espere consulta sentado num corredor.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, evangelico: 5, centro_indeciso: 4, sul_sudeste_industrial: 3 },
          },
          {
            id: 'd',
            texto: 'Faço isso com estados, municípios e entidades sociais dividindo a conta e o crédito.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 4, evangelico: 3, agro: 2, classe_media_empresarial: 2 },
          },
        ],
      },
      {
        id: 'ra_infancia',
        tema: 'Primeira infância',
        texto: 'Onde uma criança de três anos deve passar o dia: em casa ou na creche?',
        opcoes: [
          {
            id: 'a',
            texto: 'Onde a família decidir. O que o Estado deve é oferecer a vaga e apoiar quem escolhe ficar.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 5, nordeste_popular: 3, jovem_universitario: -3 },
          },
          {
            id: 'b',
            texto: 'Creche de qualidade é o investimento público com maior retorno medido que existe.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 5, classe_media_empresarial: 4, centro_indeciso: 4, jovem_universitario: 3 },
          },
          {
            id: 'c',
            texto: 'Sem creche, quem para de trabalhar é sempre a mãe. Isso também é uma escolha imposta.',
            tom: 'emocional',
            impactos: { jovem_universitario: 6, esquerda_urbana: 5, sul_sudeste_industrial: 4, evangelico: -3 },
          },
          {
            id: 'd',
            texto: 'Amplio a rede junto com estados e igrejas que já fazem esse acolhimento há décadas.',
            tom: 'conciliador',
            impactos: { evangelico: 6, centro_indeciso: 4, nordeste_popular: 4 },
          },
        ],
      },
      {
        id: 'ra_ensino_domiciliar',
        tema: 'Educação em casa',
        texto: 'Famílias que querem educar os filhos em casa devem ter esse direito reconhecido?',
        opcoes: [
          {
            id: 'a',
            texto: 'Com marco legal claro, avaliação periódica da criança e registro. Direito com responsabilidade.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 6, jovem_universitario: -4, esquerda_urbana: -4 },
          },
          {
            id: 'b',
            texto: 'A escola também socializa. Tirar a criança disso cobra um preço que ela não escolheu pagar.',
            tom: 'tecnico',
            impactos: { esquerda_urbana: 5, jovem_universitario: 4, centro_indeciso: 2, evangelico: -5 },
          },
          {
            id: 'c',
            texto: 'Não sou contra nem a favor por princípio. Quero ver a regra antes de assinar embaixo.',
            tom: 'conciliador',
            impactos: { centro_indeciso: 4, classe_media_empresarial: 3, evangelico: 1 },
          },
          {
            id: 'd',
            texto: 'Quem é contra isso na verdade quer controlar o que sua família pensa. É só isso.',
            tom: 'confronto',
            impactos: { direita_conservadora: 5, evangelico: 3, jovem_universitario: -7, esquerda_urbana: -6, centro_indeciso: -4 },
          },
        ],
      },
      {
        id: 'ra_campo',
        tema: 'Vida no campo',
        texto: 'O jovem do interior está indo embora. Como se segura uma comunidade rural de pé?',
        opcoes: [
          {
            id: 'a',
            texto: 'Com raiz: escola no distrito, posto de saúde e internet. Ninguém sai de onde tem futuro.',
            tom: 'valores',
            impactos: { agro: 6, evangelico: 5, nordeste_popular: 5, direita_conservadora: 3 },
          },
          {
            id: 'b',
            texto: 'Crédito para o pequeno produtor e assistência técnica, com meta de renda por família.',
            tom: 'tecnico',
            impactos: { agro: 7, classe_media_empresarial: 4, centro_indeciso: 3, nordeste_popular: 3 },
          },
          {
            id: 'c',
            texto: 'Meu avô saiu do interior sem nada. Não quero que nenhum jovem precise repetir isso.',
            tom: 'emocional',
            impactos: { nordeste_popular: 6, evangelico: 5, agro: 4, sul_sudeste_industrial: 3 },
          },
          {
            id: 'd',
            texto: 'Faço junto com prefeituras, cooperativas e paróquias, que conhecem o território melhor que eu.',
            tom: 'conciliador',
            impactos: { evangelico: 5, agro: 4, centro_indeciso: 4, nordeste_popular: 3 },
          },
        ],
      },
      {
        id: 'ra_midia_infantil',
        tema: 'Telas e infância',
        texto: 'Celular e rede social na mão de criança de dez anos: o Estado tem algo a dizer?',
        opcoes: [
          {
            id: 'a',
            texto: 'Tem: verificação de idade e proteção de dados de menor. A conta disso é da plataforma, não da mãe.',
            tom: 'valores',
            impactos: { evangelico: 7, direita_conservadora: 5, centro_indeciso: 5, classe_media_empresarial: 2 },
          },
          {
            id: 'b',
            texto: 'Regra baseada em evidência de saúde mental, com pediatra e escola participando do desenho.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 4, centro_indeciso: 4, jovem_universitario: 3, esquerda_urbana: 3 },
          },
          {
            id: 'c',
            texto: 'Quem cria filho sabe o que essa tela faz. Não precisa de estudo para enxergar o óbvio.',
            tom: 'emocional',
            impactos: { evangelico: 6, direita_conservadora: 5, nordeste_popular: 4, jovem_universitario: -4 },
          },
          {
            id: 'd',
            texto: 'Isso é assunto de família, não de governo. Não vou legislar sobre sala de estar.',
            tom: 'conciliador',
            impactos: { classe_media_empresarial: 3, jovem_universitario: 2, evangelico: -4, direita_conservadora: -2 },
          },
        ],
      },
      {
        id: 'ra_perdao',
        tema: 'Erro pessoal',
        texto: 'Qual foi o maior erro da sua vida pública, e o que o senhor(a) fez com ele?',
        opcoes: [
          {
            id: 'a',
            texto: 'Confiei em quem não devia e demorei a admitir. Aprendi que humildade não é fraqueza.',
            tom: 'valores',
            impactos: { evangelico: 7, centro_indeciso: 6, direita_conservadora: 4, nordeste_popular: 4 },
          },
          {
            id: 'b',
            texto: 'Errei de método numa decisão técnica, corrigi e publiquei a correção. Está tudo documentado.',
            tom: 'tecnico',
            impactos: { classe_media_empresarial: 5, centro_indeciso: 3, evangelico: -2 },
          },
          {
            id: 'c',
            texto: 'Já magoei gente que me amava por causa de política. Isso me custa até hoje.',
            tom: 'emocional',
            impactos: { evangelico: 6, nordeste_popular: 5, centro_indeciso: 4, sul_sudeste_industrial: 3 },
          },
          {
            id: 'd',
            texto: 'Meu maior erro foi ser educado demais com quem estava destruindo esse país.',
            tom: 'confronto',
            impactos: { direita_conservadora: 5, centro_indeciso: -5, evangelico: -3, classe_media_empresarial: -4 },
          },
        ],
      },
    ],
  },
];

/** Quantas perguntas cada debate usa (sorteadas do banco da emissora). */
export const PERGUNTAS_POR_DEBATE = 6;

export const BROADCASTER_BY_ID = BROADCASTERS.reduce((acc, b) => {
  acc[b.id] = b;
  return acc;
}, {});
