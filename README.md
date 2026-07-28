# Simulador de Presidente

Jogo de estratégia política em navegador, com dois modos independentes:

- **Modo Campanha** — draft de candidato, montagem de partido e coligação, debates
  ao vivo contra três emissoras e apuração eleitoral por segmento.
- **Modo Regime** — assume um sistema econômico-político e administra orçamento,
  criticidade da população e inflação até o regime cair (ou sobreviver).

React + Vite + JavaScript puro + Tailwind CSS. Sem TypeScript, sem dependência de
charting, sem back-end.

É um **PWA**: dá para instalar no celular pela tela de início e jogar offline.

> **Ficção.** Nenhum político, partido, emissora, apresentador ou instituição real
> é nomeado em qualquer ponto do código, dos dados ou dos textos. Os personagens
> são arquétipos reconhecíveis pelo estilo. As emissoras são perfis editoriais
> genéricos, não paródias de marcas existentes. As referências históricas do Modo
> Regime aparecem só como contexto educacional sobre modelos econômicos.

---

## Rodando

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview      # build de produção, com service worker ativo
npm run test:engine  # banco de calibragem dos engines, sem UI
npm run icons        # regenera os PNGs do app (só se a marca mudar)
```

O service worker só roda no build de produção. Para testar instalação e modo
offline, use `npm run preview`, não `npm run dev`.

`npm run test:engine` roda `scripts/engineSmokeTest.mjs`: imprime os números que
importam (aprovação por segmento, distribuição de resultados em 200 partidas,
duração de cada regime) e sai com código 1 se alguma invariante quebrar. É o
lugar de calibrar peso antes de gastar tempo em tela.

---

## Arquitetura

```
/src
  /data        dados puros, sem lógica
    attributes.js    8 atributos do candidato
    archetypes.js    12 arquétipos fictícios (o draft sorteia 8)
    segments.js      9 segmentos eleitorais, pesos e afinidades
    parties.js       8 partidos aliados
    broadcasters.js  3 emissoras × 11 perguntas (o debate sorteia 6)
    events.js        eventos de campanha e eventos históricos
    regimes.js       5 sistemas econômico-políticos e 3 dificuldades
  /engine      funções puras, sem JSX e sem React
    approvalEngine.js     aprovação por segmento, coligação, perfil dominante
    draftEngine.js        rodadas do draft e geração do adversário
    debateEngine.js       pontuação de resposta, tom e gafe viral
    eventEngine.js        sorteio e modulação dos eventos de campanha
    electionEngine.js     apuração, 2º turno e leitura genérica do resultado
    criticalityEngine.js  criticidade da população e condições de colapso
    economyEngine.js      arrecadação, déficit, inflação e índices
    regimeEngine.js       orquestra um turno completo do Modo Regime
    random.js             RNG determinístico (mulberry32)
  /pages       uma tela por arquivo
    Boot.jsx         abertura com animação de carregamento
    MainMenu.jsx     menu principal
    Tutorial.jsx     tutorial em abas
    Settings.jsx     configurações
    (+ as 9 telas de jogo)
  /components  AttributeCard, SegmentBar, Slider, Timer, StatTile,
               CriticalityChart, Brand, Layout
  /hooks       usePwaInstall.js
  /store       gameStore.js (partida) e settingsStore.js (preferências)
/scripts
  engineSmokeTest.mjs  banco de calibragem
  generateIcons.mjs    gera os PNGs do PWA sem dependência de imagem
```

**Regra da casa:** nenhuma fórmula mora em componente ou na store. A store guarda
estado e chama engine; o engine calcula e devolve. É o que permite testar a
matemática inteira fora do React.

---

## Modo Campanha

### Draft (8 rodadas)

A cada rodada aparece um arquétipo e você herda **um** dos 8 atributos dele. Os 8
arquétipos de cada partida são sorteados de um banco de **12**, então duas
partidas seguidas não têm o mesmo elenco. O
atributo escolhido trava e some das rodadas seguintes, então no fim os 8 slots
estão preenchidos, cada um vindo de um arquétipo diferente.

Dois modos de visibilidade: **Normal** mostra os valores antes de escolher;
**Pro** mostra `??` e só revela no fim.

O overall é a média dos 8 atributos com a **rejeição contando invertida** — 90 de
rejeição derruba o overall em vez de inflá-lo. O perfil dominante é o arquétipo
mais próximo do candidato montado, por distância euclidiana no espaço dos 8
atributos.

### Aprovação por segmento

Cada um dos 9 segmentos tem aprovação própria:

```
aprovação = piso do segmento
          + alinhamento ideológico × peso ideológico do segmento
          + atributos × afinidade do segmento
          − rejeição × sensibilidade do segmento
          + bônus de coligação
          − racha de base
          + debates e eventos
```

A **aprovação geral** é a média ponderada pelo tamanho populacional fictício de
cada segmento (os pesos somam 1,0). Centro indeciso é o maior bloco e o mais
volátil; Nordeste popular é fiel; jovem universitário some quando se decepciona.

### Coligação e racha de base

A racha nasce da **maior distância** entre quaisquer dois integrantes do palanque,
incluindo o partido do jogador. Passando de 35% do espectro, a penalidade cai
justamente no segmento mais alinhado ao candidato: coligação larga rende bancada
e custa a própria base.

### Debates

Toda opção de resposta tem um **tom** (técnico, emocional, valores, conciliador,
confronto). Cada emissora premia dois tons e transforma outros dois em **gafe
viral** — uma penalidade extra espalhada por toda a audiência do canal,
independente do conteúdo da resposta.

Cada emissora tem **11 perguntas** no banco e cada debate sorteia **6**, então a
segunda partida não repete a primeira.

Timer de 10 segundos por pergunta (ajustável para 7 ou 15 nas Configurações).
Sem resposta, entra uma neutra fraca.

Por padrão o rótulo de tom fica **escondido** — você lê o tom pelo texto, que é
como o minigame foi pensado. Quem quiser o modo fácil liga o rótulo nas
Configurações.

O impacto de cada resposta é filtrado por audiência da emissora × volatilidade do
segmento, então a mesma frase pesa muito num canal e quase nada em outro.

### Eventos

Seis eventos, com um **modulador** que decide a intensidade a partir de um
atributo do candidato:

| Evento | Modulador | Efeito |
|---|---|---|
| Escândalo de corrupção | resiliência de imagem (*mitiga*) | penaliza geral, +rejeição |
| Crise econômica | gestão (*agrava*) | pune mais quem administra mal |
| Fake news viral | resiliência de imagem (*mitiga*) | forte em rede capilar |
| Traição de aliado | rede de aliados (*mitiga*) | só dispara abaixo de 35%; remove um aliado |
| Onda orgânica | carisma (*amplifica*) | impulso |
| Apoio de categoria | rede de aliados (*amplifica*) | impulso + rede |

O mesmo escândalo tira ~12 pontos de um candidato blindado e ~87 de um frágil.

### Apuração

`≥ 50%` eleito no 1º turno · `35–50%` vai ao 2º turno contra um adversário gerado
com atributos aleatórios · `< 35%` derrotado. O comparativo textual descreve o
**formato** da eleição (polarizada, de centro, avassaladora), sem citar pleito,
ano ou nome.

---

## Modo Regime

### Criticidade da população (0–100)

```
subida  = 0,40·repressão + 0,60·fome + 0,50·guerra + 0,30·desigualdade
descida = 0,30·estoque de propaganda + 0,55·estoque de entrega real
delta   = (subida − descida) × escala × dificuldade × sistema + castigo de inflação
```

A diferença entre os dois redutores é o coração do modo:

- **Propaganda** é estoque **temporário**: decai 40% por turno. Parou de gastar,
  evapora em dois ou três turnos.
- **Entrega real** (educação, saúde, infraestrutura) é estoque **permanente**:
  acumula e não decai. Custa caro, demora, e nunca é desfeita.

Chegando a 100, o regime cai — revolução, golpe ou greve geral, sorteados com
peso do próprio sistema.

### Economia

O orçamento sempre soma 100%, mas o **gasto real** cresce com defesa, guerra e
território ocupado. Quando supera a arrecadação simulada, a diferença vira
inflação. Acima de 8% ao ano, a inflação atravessa a propaganda: o preço no
mercado fala mais alto que o rádio.

Produção e poder militar usam modelo de **alvo**, não de acúmulo — o orçamento
define o patamar sustentável e o índice caminha até lá. Sem isso o país vira uma
bola de neve produtiva que torna a arrecadação infinita depois de dez turnos.

### Sistemas

| Sistema | Mecânica central | Duração típica* |
|---|---|---|
| Economia Planejada | indústria cresce, consumo falta | ~20 anos |
| Corporativismo Estatal | propaganda ampliada, dissidência acumula | ~11 anos |
| Hipermilitarização Expansionista | território cresce sozinho; sobre-extensão mata | ~5–7 anos |
| Capitalismo Liberal | arrecada bem, desigualdade sobe sozinha | 25 anos |
| Social-Democracia | entrega social com eficiência máxima | 25 anos |

\* na dificuldade Difícil, com orçamento padrão e sem intervenção do jogador.

### Dificuldades

| Nível | Estrutura |
|---|---|
| **Fácil** | 3 turnos, 2 controles (Defesa × Social), sem eventos |
| **Médio** | 8 turnos, 5 sliders, 9 segmentos visíveis, eventos avulsos |
| **Difícil** | 25 turnos (1 ano cada), eventos em cadeia, colapso por sobre-extensão |

A **sobre-extensão** é a assinatura do sistema expansionista: o território cresce
8 pontos por turno mesmo sem ordem do jogador, e cada ponto de poder militar
sustenta só uma fração disso. Ultrapassou o limite, colapso automático — o mesmo
desfecho que a história reservou aos regimes expansionistas.

---

## Aplicativo (PWA)

- **Instalável**: no Android/desktop o próprio menu oferece "Instalar aplicativo"
  via `beforeinstallprompt`. No iOS o navegador não permite instalação
  programática, então o app explica o caminho manual (Compartilhar → Adicionar à
  Tela de Início).
- **Offline**: Workbox pré-cacheia o app inteiro no primeiro acesso. Depois
  disso o jogo abre e roda sem rede — não há back-end nem chamada externa.
- **Abertura**: tela de splash com o brasão sendo desenhado e barra de
  carregamento, pulável e desligável nas Configurações.
- **Menu**: nome do jogo, "Continuar partida" quando há jogo salvo, "Iniciar
  partida" abrindo os dois modos, Tutorial, Configurações e instalação.
- **Configurações**: rótulo de tom no debate, visibilidade do draft, tempo por
  pergunta, redução de animações, pular abertura e apagar progresso.
- **Tutorial**: três abas cobrindo as mecânicas que decidem a partida sem avisar.
- **Persistência**: partida e preferências ficam em `localStorage`. Fechar o app
  no meio de um debate e voltar depois funciona.
- **Mobile**: safe areas do iOS respeitadas, alvos de toque de 44px, sliders mais
  grossos no celular e zero rolagem horizontal (verificado em viewport de 390px
  nas nove telas).
- **Acessibilidade**: `prefers-reduced-motion` respeitado, foco sempre visível,
  `aria-pressed`/`role="switch"`/`role="tab"` nos controles e `aria-live` na
  barra de carregamento.

---

## O que falta para a próxima etapa

Em ordem de impacto no loop, não de esforço.

**Loop e balanceamento**
1. Eventos de campanha só disparam depois de um debate. Vale espalhá-los por uma
   linha do tempo própria, com 2–3 janelas de decisão entre eles.
2. Segundo turno é uma conta só. Merece pelo menos um debate exclusivo e uma
   rodada de migração de voto segmento a segmento.
3. Calibrar contra jogadores reais. Os alvos atuais saíram de simulação, não de
   gente jogando.
4. O Modo Regime não tem escolha significativa nos primeiros turnos além dos
   sliders. Faltam decisões de política com texto, como as do Modo Campanha.

**Conteúdo**
5. Eventos históricos por sistema, em vez de um pool único para os cinco.
6. Mais partidos aliados e um sistema de negociação (o que cada um cobra para
   entrar na coligação).
7. Variantes de adversário de 2º turno com arquétipo definido, não só atributos
   aleatórios.

**Produto**
8. Histórico de partidas e comparação entre runs — hoje o resultado some ao
   começar a próxima.
9. Testes automatizados de componente. O `test:engine` cobre a matemática, mas
   as telas só foram verificadas dirigindo o navegador na mão.
10. Notificação de atualização do service worker ("nova versão disponível,
    recarregar?"), hoje a troca é silenciosa.
11. Tradução/localização, se a ideia for publicar fora do Brasil.
12. Áudio: o jogo é inteiramente silencioso.
