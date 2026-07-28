import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Screen, ScreenHeader } from '../components/Layout.jsx';
import { useGameStore } from '../store/gameStore.js';
import { REGIMES, DIFFICULTIES } from '../data/regimes.js';

const ACENTOS = {
  moss: 'border-moss-500/60 bg-moss-900/20',
  brass: 'border-brass-600/60 bg-brass-700/10',
  alarm: 'border-alarm/60 bg-alarm/5',
  graphite: 'border-graphite-500/60 bg-graphite-800/40',
  calm: 'border-calm/60 bg-calm/5',
};

/** Barra pequena para comparar parâmetros entre sistemas. */
function ParamBar({ rotulo, valor, max = 2 }) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-[0.7rem] text-graphite-500">{rotulo}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-graphite-800">
        <div className="h-full rounded-full bg-brass-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-[0.7rem] tabular-nums text-graphite-500">
        {valor.toFixed(1)}
      </span>
    </div>
  );
}

export default function RegimeSelect() {
  const navigate = useNavigate();
  const iniciarRegime = useGameStore((s) => s.iniciarRegime);

  const [regimeId, setRegimeId] = useState(null);
  const [dificuldadeId, setDificuldadeId] = useState('medio');

  const regimeEscolhido = REGIMES.find((r) => r.id === regimeId);

  return (
    <Screen>
      <ScreenHeader
        passo="modo 2"
        titulo="Regime Histórico"
        subtitulo="Escolha o sistema econômico-político que você vai administrar. Cada um tem uma mecânica central diferente e uma forma preferida de acabar mal."
      />

      {/* ------------------------------------------------------- dificuldade */}
      <section className="mb-8">
        <div className="label-caps mb-3">dificuldade — muda a estrutura da partida, não só os números</div>
        <div className="grid gap-3 md:grid-cols-3">
          {DIFFICULTIES.map((d) => {
            const ativo = dificuldadeId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDificuldadeId(d.id)}
                className={[
                  'panel p-4 text-left transition-colors',
                  ativo ? 'border-brass-600 bg-brass-600/10' : 'panel-hover',
                ].join(' ')}
              >
                <div className="flex items-baseline justify-between">
                  <span className={`font-display text-xl ${ativo ? 'text-brass-300' : 'text-graphite-100'}`}>
                    {d.nome}
                  </span>
                  <span className="text-xs tabular-nums text-graphite-500">{d.turnos} turnos</span>
                </div>
                <p className="mt-1 text-xs font-medium text-graphite-300">{d.resumo}</p>
                <p className="mt-2 text-xs leading-snug text-graphite-500">{d.descricao}</p>

                <ul className="mt-3 space-y-0.5 text-[0.7rem] text-graphite-600">
                  <li>{d.slidersLiberados.length} controles de orçamento</li>
                  <li>{d.mostrarSegmentos ? '9 segmentos visíveis' : 'segmentos ocultos'}</li>
                  <li>
                    {d.eventosEncadeados
                      ? 'eventos históricos em cadeia'
                      : d.eventosAtivos
                        ? 'eventos históricos avulsos'
                        : 'sem eventos'}
                  </li>
                  {d.overextension && <li className="text-alarm/80">colapso por sobre-extensão ativo</li>}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------- sistemas */}
      <section>
        <div className="label-caps mb-3">sistema econômico-político</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REGIMES.map((r) => {
            const ativo = regimeId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegimeId(r.id)}
                className={[
                  'panel flex flex-col p-5 text-left transition-all',
                  ativo ? `${ACENTOS[r.acento]} -translate-y-0.5 shadow-lg shadow-black/40` : 'panel-hover',
                ].join(' ')}
              >
                <h2 className="font-display text-xl leading-tight text-graphite-100">{r.nome}</h2>
                <p className="mt-0.5 text-xs text-brass-400">{r.subtitulo}</p>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite-400">{r.mecanica}</p>

                <div className="mt-4 rounded border border-graphite-800 bg-graphite-950/40 p-2.5">
                  <div className="label-caps mb-1 text-graphite-600">trade-off</div>
                  <p className="text-xs text-graphite-300">{r.tradeoff}</p>
                </div>

                <div className="mt-4 space-y-1.5">
                  <ParamBar rotulo="crescimento" valor={r.params.crescimentoIndustrial} />
                  <ParamBar rotulo="descontentamento" valor={r.params.multiplicadorDescontentamento} />
                  <ParamBar rotulo="risco de guerra" valor={r.params.riscoGuerra} />
                  <ParamBar rotulo="efeito propaganda" valor={r.params.propagandaMult} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded border border-graphite-700 px-2 py-0.5 text-[0.7rem] text-graphite-400">
                    índice: {r.indicePrincipal.nome}
                  </span>
                  {r.params.expansionista && (
                    <span className="rounded border border-alarm/50 px-2 py-0.5 text-[0.7rem] text-alarm">
                      expansionista
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ contexto educacional */}
      {regimeEscolhido && (
        <section className="panel mt-6 border-graphite-700 p-5">
          <div className="label-caps mb-2">contexto histórico</div>
          <p className="text-sm leading-relaxed text-graphite-300">{regimeEscolhido.inspiracao}</p>
          <p className="mt-2 text-xs text-graphite-600">
            Referência de modelo econômico apenas. O jogo não representa governos, líderes ou
            organizações específicas.
          </p>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary"
          disabled={!regimeId}
          onClick={() => {
            iniciarRegime(regimeId, dificuldadeId);
            navigate('/regime/painel');
          }}
        >
          Assumir o governo →
        </button>
        {!regimeId && <span className="text-xs text-graphite-500">Escolha um sistema para continuar.</span>}
      </div>
    </Screen>
  );
}
