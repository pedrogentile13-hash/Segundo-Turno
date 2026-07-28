import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

import { Screen, ScreenHeader, StepTrail } from '../components/Layout.jsx';
import SegmentBar from '../components/SegmentBar.jsx';
import StatTile from '../components/StatTile.jsx';
import { useGameStore } from '../store/gameStore.js';
import { SEGMENTS } from '../data/segments.js';
import { ATTRIBUTE_BY_ID } from '../data/attributes.js';

const ESTILO_STATUS = {
  eleito_primeiro_turno: { cor: 'text-calm', borda: 'border-calm/50 bg-calm/5', selo: 'vitória' },
  eleito_segundo_turno: { cor: 'text-calm', borda: 'border-calm/50 bg-calm/5', selo: 'vitória' },
  derrotado_segundo_turno: { cor: 'text-alarm', borda: 'border-alarm/50 bg-alarm/5', selo: 'derrota' },
  derrotado: { cor: 'text-alarm', borda: 'border-alarm/50 bg-alarm/5', selo: 'derrota' },
};

export default function CampaignResult() {
  const navigate = useNavigate();

  const campanha = useGameStore((s) => s.campanha);
  const apurarEleicao = useGameStore((s) => s.apurarEleicao);
  const iniciarCampanha = useGameStore((s) => s.iniciarCampanha);
  const perfil = useGameStore((s) => s.perfilDominante)();
  const attrs = useGameStore((s) => s.atributosCandidato)();
  const overall = useGameStore((s) => s.overallCandidato)();

  const [resultado, setResultado] = useState(campanha.resultado);

  // Apura uma única vez ao entrar na tela.
  useEffect(() => {
    if (!resultado && campanha.draftCompleto) setResultado(apurarEleicao());
  }, [resultado, campanha.draftCompleto, apurarEleicao]);

  if (!campanha.draftCompleto) return <Navigate to="/campanha/draft" replace />;
  if (!resultado) return null;

  const estilo = ESTILO_STATUS[resultado.status];
  const ordenados = [...SEGMENTS].sort((a, b) => resultado.porSegmento[b.id] - resultado.porSegmento[a.id]);

  return (
    <Screen>
      <StepTrail atual={4} />
      <ScreenHeader passo="apuração encerrada" titulo="Resultado da eleição" />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* ------------------------------------------------- placar central */}
          <section className={`panel p-8 text-center ${estilo.borda}`}>
            <div className={`label-caps ${estilo.cor}`}>{estilo.selo}</div>
            <div className={`mt-3 font-display text-7xl tabular-nums ${estilo.cor}`}>
              {resultado.percentualFinal}
              <span className="text-4xl">%</span>
            </div>
            <h2 className="mt-2 font-display text-2xl text-graphite-100">{resultado.titulo}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-graphite-400">
              {resultado.comparativo}
            </p>
          </section>

          {/* --------------------------------------------------- segundo turno */}
          {resultado.runoff && (
            <section className="panel p-6">
              <div className="label-caps mb-4">apuração do segundo turno</div>

              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-brass-300">Sua candidatura</span>
                    <span className="font-display text-xl tabular-nums text-brass-300">
                      {resultado.runoff.meuPercentual}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-graphite-800">
                    <div className="h-full bg-brass-500" style={{ width: `${resultado.runoff.meuPercentual}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-graphite-300">{resultado.runoff.adversario.nome}</span>
                    <span className="font-display text-xl tabular-nums text-graphite-300">
                      {resultado.runoff.percentualAdversario}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-graphite-800">
                    <div
                      className="h-full bg-graphite-500"
                      style={{ width: `${resultado.runoff.percentualAdversario}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StatTile rotulo="sua aprovação" valor={resultado.runoff.minhaAprovacao} sufixo="%" />
                <StatTile rotulo="aprovação do adversário" valor={resultado.runoff.aprovacaoAdversario} sufixo="%" />
                <StatTile
                  rotulo="rejeição do adversário"
                  valor={resultado.runoff.adversario.attrs.rejeicao}
                  tom={resultado.runoff.adversario.attrs.rejeicao > attrs.rejeicao ? 'bom' : 'ruim'}
                  nota={
                    resultado.runoff.adversario.attrs.rejeicao > attrs.rejeicao
                      ? 'Ele tinha mais teto contra do que você.'
                      : 'Ele era mais palatável no segundo turno.'
                  }
                />
              </div>
            </section>
          )}

          {/* ------------------------------------------------ mapa eleitoral */}
          <section className="panel p-6">
            <div className="label-caps mb-4">desempenho final por segmento</div>
            <div className="space-y-4">
              {ordenados.map((seg) => (
                <SegmentBar
                  key={seg.id}
                  segmentoId={seg.id}
                  valor={resultado.porSegmento[seg.id]}
                  delta={campanha.modificadores[seg.id] ?? null}
                  mostrarPeso
                />
              ))}
            </div>
          </section>

          {/* -------------------------------------------------- linha do tempo */}
          {(campanha.debatesFeitos.length > 0 || campanha.eventosLog.length > 0) && (
            <section className="panel p-6">
              <div className="label-caps mb-4">o que aconteceu na campanha</div>
              <ol className="space-y-3">
                {campanha.debatesFeitos.map((d) => (
                  <li key={d.broadcasterId} className="flex gap-3 border-l-2 border-graphite-700 pl-4">
                    <div>
                      <div className="text-sm text-graphite-200">
                        Debate — {d.gafes > 0 ? `${d.gafes} gafe(s) viral(is)` : 'sem gafes'}, {d.acertosDeTom} acerto(s)
                        de tom
                      </div>
                      <div className={`text-xs ${d.saldo > 0 ? 'text-calm' : 'text-alarm'}`}>
                        saldo {d.saldo > 0 ? '+' : ''}
                        {d.saldo}
                      </div>
                    </div>
                  </li>
                ))}
                {campanha.eventosLog.map((e, i) => (
                  <li key={`${e.evento.id}-${i}`} className="flex gap-3 border-l-2 border-graphite-700 pl-4">
                    <div>
                      <div className="text-sm text-graphite-200">{e.evento.manchete}</div>
                      <div className="text-xs text-graphite-500">{e.resumo}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* ------------------------------------------------------- lateral */}
        <aside className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
          <div className="panel p-4">
            <div className="label-caps">candidatura</div>
            <div className="mt-1 font-display text-lg text-brass-300">{perfil.dominante.nome}</div>
            <p className="mt-1 text-xs text-graphite-500">{perfil.dominante.epiteto}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile rotulo="overall" valor={overall} />
            <StatTile
              rotulo="rejeição final"
              valor={Math.round(attrs.rejeicao)}
              tom={attrs.rejeicao > 65 ? 'ruim' : 'neutro'}
            />
          </div>

          <div className="panel p-4">
            <div className="label-caps mb-2">atributos finais</div>
            <ul className="space-y-1">
              {Object.entries(attrs).map(([id, valor]) => (
                <li key={id} className="flex justify-between text-xs">
                  <span className="text-graphite-500">{ATTRIBUTE_BY_ID[id]?.nome}</span>
                  <span className="tabular-nums text-graphite-200">{Math.round(valor)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-4">
            <div className="label-caps mb-2">coligação no fim</div>
            <p className="text-xs leading-relaxed text-graphite-400">
              {campanha.aliadosIds.length === 0
                ? 'Você chegou ao fim sem nenhum aliado no palanque.'
                : `${resultado.coligacao.cadeirasTotais} cadeiras aliadas.`}
              {resultado.coligacao.rachaPenalidade > 0 &&
                ` A racha de base custou ${resultado.coligacao.rachaPenalidade} pontos em ${resultado.coligacao.segmentoRachaNome}.`}
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => {
                iniciarCampanha(campanha.visibilidade);
                navigate('/campanha/draft');
              }}
            >
              Nova campanha
            </button>
            <button type="button" className="btn-ghost w-full" onClick={() => navigate('/regime')}>
              Jogar Modo Regime →
            </button>
          </div>
        </aside>
      </div>
    </Screen>
  );
}
