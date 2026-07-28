import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { VISIBILITY_MODES } from '../engine/draftEngine.js';

function ModeCard({ etiqueta, titulo, descricao, itens, cta, onClick, acento }) {
  return (
    <article className="panel panel-hover flex flex-col p-6">
      <span className={`label-caps ${acento}`}>{etiqueta}</span>
      <h2 className="mt-2 font-display text-2xl text-graphite-100">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-graphite-400">{descricao}</p>

      <ul className="mt-4 flex-1 space-y-1.5">
        {itens.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-graphite-300">
            <span className="text-brass-600">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onClick} className="btn-primary mt-6 w-full">
        {cta}
      </button>
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const iniciarCampanha = useGameStore((s) => s.iniciarCampanha);
  const visibilidade = useGameStore((s) => s.campanha.visibilidade);
  const definirVisibilidade = useGameStore((s) => s.definirVisibilidade);
  const reiniciarRegime = useGameStore((s) => s.reiniciarRegime);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <div className="label-caps text-brass-500">simulação política · ficção</div>
          <h1 className="mt-3 font-display text-4xl text-graphite-100 sm:text-5xl">Simulador de Presidente</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-graphite-400">
            Monte um candidato juntando pedaços de oito arquétipos, arme uma coligação que não se
            estilhace no meio do caminho e aguente três debates ao vivo. Ou pule a eleição e assuma
            um regime inteiro, para descobrir em quantos anos ele cai.
          </p>
        </header>

        {/* Escolha de visibilidade do draft */}
        <section className="panel mb-8 p-5">
          <div className="label-caps mb-3">modo de visibilidade do draft</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {VISIBILITY_MODES.map((modo) => {
              const ativo = visibilidade === modo.id;
              return (
                <button
                  key={modo.id}
                  type="button"
                  onClick={() => definirVisibilidade(modo.id)}
                  className={[
                    'rounded-md border px-4 py-3 text-left transition-colors',
                    ativo
                      ? 'border-brass-600 bg-brass-600/10'
                      : 'border-graphite-700 hover:border-graphite-500',
                  ].join(' ')}
                >
                  <div className={`text-sm font-semibold ${ativo ? 'text-brass-300' : 'text-graphite-200'}`}>
                    {modo.nome}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-graphite-500">{modo.descricao}</div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <ModeCard
            etiqueta="modo 1"
            acento="text-brass-500"
            titulo="Campanha Eleitoral"
            descricao="Do draft do candidato até a apuração, passando pelo palanque e pelo estúdio."
            itens={[
              'Draft de 8 rodadas contra 8 arquétipos fictícios',
              'Partido em 2 eixos e coligação de até 3 aliados',
              '9 segmentos eleitorais com aprovação independente',
              '3 emissoras de debate com timer de 10 segundos',
              'Eventos de campanha entre os debates',
            ]}
            cta="Começar campanha"
            onClick={() => {
              iniciarCampanha(visibilidade);
              navigate('/campanha/draft');
            }}
          />

          <ModeCard
            etiqueta="modo 2"
            acento="text-calm"
            titulo="Regime Histórico"
            descricao="Cinco sistemas econômico-políticos, orçamento fechado em 100% e uma população que perde a paciência."
            itens={[
              '5 sistemas inspirados em modelos históricos reais',
              'Sliders de orçamento com recálculo em tempo real',
              'Criticidade da população como estatística central',
              'Inflação corroendo a aprovação por baixo',
              '3 dificuldades que mudam a estrutura da partida',
            ]}
            cta="Escolher sistema"
            onClick={() => {
              reiniciarRegime();
              navigate('/regime');
            }}
          />
        </div>

        <footer className="mt-10 border-t border-graphite-800 pt-6">
          <p className="text-xs leading-relaxed text-graphite-600">
            Obra de ficção. Arquétipos, partidos, emissoras, apresentadores e segmentos eleitorais
            são inventados e não representam pessoas, legendas, veículos ou instituições reais.
            As referências históricas do Modo Regime aparecem apenas como contexto educacional
            sobre modelos econômicos.
          </p>
        </footer>
      </div>
    </div>
  );
}
