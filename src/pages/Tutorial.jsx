import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Screen, ScreenHeader } from '../components/Layout.jsx';

/**
 * Tutorial em abas. Explica as mecânicas que não são óbvias na primeira
 * partida — sobretudo as que decidem o resultado sem avisar (rejeição como
 * teto, racha de coligação, gafe viral, propaganda temporária).
 */

const ABAS = [
  {
    id: 'basico',
    nome: 'Começando',
    blocos: [
      {
        titulo: 'Dois jogos no mesmo app',
        texto:
          'O Modo Campanha é uma eleição: você monta um candidato e tenta chegar a 50%. O Modo Regime pula a eleição — você já está no poder e a pergunta é quanto tempo consegue ficar. Os dois são independentes e podem ser jogados em qualquer ordem.',
      },
      {
        titulo: 'Nada aqui é sorte pura',
        texto:
          'Eventos são sorteados, mas o tamanho do impacto vem sempre de um atributo seu. O mesmo escândalo tira dois pontos de um candidato blindado e vinte de um frágil. Perder por azar existe; perder só por azar, não.',
      },
      {
        titulo: 'A partida fica salva',
        texto:
          'Pode fechar o app no meio. Ao voltar, o menu oferece "Continuar partida" de onde você parou. Para zerar, use Configurações → Apagar partida em andamento.',
      },
    ],
  },
  {
    id: 'campanha',
    nome: 'Campanha',
    blocos: [
      {
        titulo: 'Draft: 8 rodadas, 8 arquétipos',
        texto:
          'A cada rodada aparece um arquétipo e você herda UM atributo dele. O atributo escolhido trava e some das próximas rodadas. Como só existem 8 slots e 8 rodadas, toda escolha tira uma opção do seu futuro: pegar carisma 91 agora significa herdar o carisma de mais ninguém.',
      },
      {
        titulo: 'Rejeição é teto, não é atributo ruim',
        texto:
          'Rejeição alta não reduz um pouco cada segmento: ela corta o máximo que você consegue alcançar. Um candidato com rejeição 80 pode ter overall alto e ainda assim não passar de 40% em lugar nenhum. No draft, herdar a rejeição BAIXA de um arquétipo é jogada de primeira linha.',
      },
      {
        titulo: 'Coligação: bancada custa base',
        texto:
          'Cada aliado traz cadeiras e ajuda no centro. Mas a penalidade de "racha" nasce da maior distância ideológica entre quaisquer dois membros do palanque, incluindo você. Somar um partido liberal e um estatista rende bancada e detona justamente o segmento que era mais seu.',
      },
      {
        titulo: 'Debate: o tom vale mais que a resposta',
        texto:
          'Cada emissora premia dois tons e transforma outros dois em gafe viral. Gafe não é só perder ponto na pergunta: é uma penalidade extra espalhada por toda a audiência daquele canal. Uma resposta tecnicamente impecável na emissora errada é pior que uma resposta mediana no tom certo.',
      },
      {
        titulo: 'O relógio conta',
        texto:
          'São 10 segundos por pergunta (ajustável nas Configurações). Sem resposta, entra uma neutra fraca que desagrada o centro e a juventude. Ficar em silêncio é uma resposta, e é uma resposta ruim.',
      },
    ],
  },
  {
    id: 'regime',
    nome: 'Regime',
    blocos: [
      {
        titulo: 'Criticidade é o placar',
        texto:
          'Vai de 0 a 100 e sobe com repressão, fome, guerra prolongada e desigualdade. Chegando a 100, o regime cai — revolução, golpe ou greve geral, conforme o sistema. Tudo mais no painel existe para empurrar esse número para baixo.',
      },
      {
        titulo: 'Propaganda × entrega real',
        texto:
          'Propaganda derruba criticidade na hora, mas é estoque temporário: decai 40% por turno assim que você para de gastar. Educação, saúde e infraestrutura formam o estoque de entrega real, que acumula e nunca é desfeito. Propaganda ganha o turno; entrega ganha a partida.',
      },
      {
        titulo: 'A inflação atravessa a propaganda',
        texto:
          'O orçamento sempre soma 100%, mas o gasto REAL cresce com defesa, guerra e território ocupado. Passando da arrecadação, a diferença vira inflação — e acima de 8% ao ano a inflação bate na aprovação mesmo com propaganda no talo. É a mecânica que impede a estratégia de só imprimir aprovação.',
      },
      {
        titulo: 'Sobre-extensão territorial',
        texto:
          'Nos sistemas expansionistas o território cresce sozinho a cada turno, mesmo sem você mandar. Cada ponto de poder militar sustenta só uma fração disso. Ultrapassou o limite, o colapso é automático e não tem como negociar — é a armadilha embutida no sistema.',
      },
      {
        titulo: 'A dificuldade muda a estrutura',
        texto:
          'Fácil são 3 turnos com dois controles. Médio libera os cinco sliders e o painel dos 9 segmentos. Difícil vira simulação ano a ano por 25 anos, com eventos históricos em cadeia e a sobre-extensão ligada. Não é o mesmo jogo com números maiores.',
      },
    ],
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [aba, setAba] = useState('basico');

  const ativa = ABAS.find((a) => a.id === aba);

  return (
    <Screen largura="max-w-2xl">
      <ScreenHeader
        passo="como se joga"
        titulo="Tutorial"
        subtitulo="As mecânicas que decidem a partida sem avisar."
      />

      <div
        role="tablist"
        aria-label="Seções do tutorial"
        className="mb-5 flex gap-2 overflow-x-auto pb-1"
      >
        {ABAS.map((a) => {
          const ativo = aba === a.id;
          return (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={ativo}
              onClick={() => setAba(a.id)}
              className={[
                'shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                ativo
                  ? 'bg-brass-600 text-graphite-950'
                  : 'border border-graphite-700 text-graphite-300 hover:border-brass-600/60',
              ].join(' ')}
            >
              {a.nome}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {ativa.blocos.map((b) => (
          <section key={b.titulo} className="panel p-5">
            <h2 className="font-display text-lg text-brass-300">{b.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite-300">{b.texto}</p>
          </section>
        ))}
      </div>

      <button type="button" className="btn-ghost mt-5 w-full py-3" onClick={() => navigate('/menu')}>
        ← Voltar ao menu
      </button>
    </Screen>
  );
}
