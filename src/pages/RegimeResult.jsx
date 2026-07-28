import { useNavigate, Navigate } from 'react-router-dom';

import { Screen, ScreenHeader } from '../components/Layout.jsx';
import StatTile from '../components/StatTile.jsx';
import CriticalityChart from '../components/CriticalityChart.jsx';
import { useGameStore } from '../store/gameStore.js';
import { summarizeRun } from '../engine/regimeEngine.js';

export default function RegimeResult() {
  const navigate = useNavigate();
  const regime = useGameStore((s) => s.regime);
  const reiniciarRegime = useGameStore((s) => s.reiniciarRegime);

  if (!regime || !regime.fim) return <Navigate to="/regime" replace />;

  const resumo = summarizeRun(regime);
  const sobreviveu = resumo.sobreviveu;

  const anoFinal = regime.dificuldadeId === 'dificil' ? `${resumo.anos} anos` : `${resumo.anos} turnos`;

  return (
    <Screen>
      <ScreenHeader passo={`${resumo.regime.nome} · ${resumo.dificuldade.nome}`} titulo="Fim do regime" />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <section
            className={`panel p-6 text-center sm:p-8 ${sobreviveu ? 'border-calm/50 bg-calm/5' : 'border-alarm/50 bg-alarm/5'}`}
          >
            <div className="font-display text-5xl">{resumo.causa.icone}</div>
            <div className={`label-caps mt-4 ${sobreviveu ? 'text-calm' : 'text-alarm'}`}>
              {sobreviveu ? 'o regime chegou ao fim do período' : 'o regime caiu'}
            </div>
            <h2 className={`mt-1 font-display text-2xl sm:text-3xl ${sobreviveu ? 'text-calm' : 'text-alarm'}`}>
              {resumo.causa.nome}
            </h2>

            <div className="mt-6 font-display text-4xl tabular-nums text-graphite-100 sm:text-5xl lg:text-6xl">{anoFinal}</div>
            <p className="mt-1 text-xs text-graphite-500">duração do regime</p>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-graphite-400">
              {resumo.causa.texto}
            </p>

            {resumo.causa.id === 'colapso_overextension' && (
              <p className="mx-auto mt-3 max-w-xl text-xs text-graphite-500">
                Território ocupado: {resumo.causa.territorio} · limite que a capacidade militar sustentava:{' '}
                {resumo.causa.sustentavel}
              </p>
            )}
          </section>

          <section>
            <div className="label-caps mb-2">criticidade × tempo</div>
            <CriticalityChart
              historico={regime.historico}
              altura={240}
              unidade={regime.dificuldadeId === 'dificil' ? 'anos' : 'turno'}
            />
          </section>

          {resumo.eventos.length > 0 && (
            <section className="panel p-6">
              <div className="label-caps mb-4">eventos que atravessaram o governo</div>
              <ul className="space-y-3">
                {resumo.eventos.map((e, i) => (
                  <li key={`${e.id}-${i}`} className="flex gap-3 border-l-2 border-graphite-700 pl-4">
                    <span className="font-display text-lg text-brass-400">{e.icone}</span>
                    <div>
                      <div className="text-sm text-graphite-200">{e.nome}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-graphite-500">{e.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel p-6">
            <div className="label-caps mb-3">o sistema que você administrou</div>
            <h3 className="font-display text-xl text-graphite-100">{resumo.regime.nome}</h3>
            <p className="mt-2 text-sm leading-relaxed text-graphite-400">{resumo.regime.mecanica}</p>
            <div className="mt-4 rounded border border-graphite-800 bg-graphite-950/40 p-3">
              <div className="label-caps mb-1">contexto histórico</div>
              <p className="text-xs leading-relaxed text-graphite-400">{resumo.regime.inspiracao}</p>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-8 lg:h-fit">
          <StatTile
            rotulo="pico de criticidade"
            valor={resumo.picoCriticidade}
            tom={resumo.picoCriticidade >= 90 ? 'ruim' : resumo.picoCriticidade >= 60 ? 'atencao' : 'bom'}
          />
          <StatTile
            rotulo="inflação média"
            valor={resumo.mediaInflacao}
            sufixo="%"
            tom={resumo.mediaInflacao > 25 ? 'ruim' : resumo.mediaInflacao > 10 ? 'atencao' : 'bom'}
          />
          <div className="grid grid-cols-2 gap-3">
            <StatTile rotulo="produção final" valor={regime.producao} />
            <StatTile rotulo="poder militar" valor={regime.poderMilitar} />
          </div>
          <StatTile
            rotulo="entrega social acumulada"
            valor={regime.entregaStock}
            tom="bom"
            nota="Efeito permanente conquistado"
          />
          <StatTile
            rotulo="estoque de propaganda"
            valor={regime.propagandaStock}
            tom="atencao"
            nota="Some em 2-3 turnos sem gasto"
          />

          <div className="space-y-2 pt-2">
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => {
                reiniciarRegime();
                navigate('/regime');
              }}
            >
              Tentar outro sistema
            </button>
            <button type="button" className="btn-ghost w-full" onClick={() => navigate('/campanha/draft')}>
              Jogar Modo Campanha →
            </button>
          </div>
        </aside>
      </div>
    </Screen>
  );
}
