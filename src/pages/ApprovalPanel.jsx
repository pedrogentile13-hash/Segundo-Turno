import { useNavigate, Navigate } from 'react-router-dom';

import { Screen, ScreenHeader, StepTrail } from '../components/Layout.jsx';
import SegmentBar from '../components/SegmentBar.jsx';
import StatTile from '../components/StatTile.jsx';
import { useGameStore } from '../store/gameStore.js';
import { SEGMENTS } from '../data/segments.js';
import { ATTRIBUTE_BY_ID } from '../data/attributes.js';
import { LIMIAR_PRIMEIRO_TURNO, LIMIAR_SEGUNDO_TURNO } from '../engine/electionEngine.js';

/** Régua com os dois limiares da eleição e a posição atual da campanha. */
function ReguaEleitoral({ aprovacao }) {
  return (
    <div className="panel p-5">
      <div className="label-caps mb-4">onde a campanha está agora</div>

      <div className="relative h-10">
        <div className="absolute inset-x-0 top-4 h-2 overflow-hidden rounded-full bg-graphite-800">
          <div className="h-full bg-alarm/60" style={{ width: `${LIMIAR_SEGUNDO_TURNO}%` }} />
          <div
            className="absolute top-0 h-full bg-brass-700/60"
            style={{ left: `${LIMIAR_SEGUNDO_TURNO}%`, width: `${LIMIAR_PRIMEIRO_TURNO - LIMIAR_SEGUNDO_TURNO}%` }}
          />
          <div
            className="absolute top-0 h-full bg-calm/60"
            style={{ left: `${LIMIAR_PRIMEIRO_TURNO}%`, right: 0 }}
          />
        </div>

        <div
          className="absolute top-1.5 -translate-x-1/2 transition-[left] duration-500"
          style={{ left: `${Math.min(100, Math.max(0, aprovacao))}%` }}
        >
          <div className="h-7 w-1 rounded-full bg-brass-300 shadow-lg shadow-black/60" />
        </div>
      </div>

      <div className="mt-1 flex justify-between text-[0.7rem] text-graphite-500">
        <span>derrotado &lt; {LIMIAR_SEGUNDO_TURNO}%</span>
        <span>2º turno</span>
        <span>1º turno ≥ {LIMIAR_PRIMEIRO_TURNO}%</span>
      </div>
    </div>
  );
}

export default function ApprovalPanel() {
  const navigate = useNavigate();

  const campanha = useGameStore((s) => s.campanha);
  const aprovacao = useGameStore((s) => s.aprovacao)();
  const attrs = useGameStore((s) => s.atributosCandidato)();
  const overall = useGameStore((s) => s.overallCandidato)();
  const perfil = useGameStore((s) => s.perfilDominante)();

  if (!campanha.draftCompleto) return <Navigate to="/campanha/draft" replace />;

  const ordenados = [...SEGMENTS].sort((a, b) => aprovacao.porSegmento[b.id] - aprovacao.porSegmento[a.id]);
  const melhor = ordenados[0];
  const pior = ordenados[ordenados.length - 1];

  const tomGeral = aprovacao.geral >= 50 ? 'bom' : aprovacao.geral >= 35 ? 'atencao' : 'ruim';

  return (
    <Screen>
      <StepTrail atual={2} />
      <ScreenHeader
        passo="passo 3"
        titulo="Painel de aprovação"
        subtitulo="Cada segmento tem uma aprovação própria. A geral é a média ponderada pelo tamanho de cada um no eleitorado."
        acao={
          <button type="button" className="btn-primary" onClick={() => navigate('/campanha/debates')}>
            Ir para os debates →
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <ReguaEleitoral aprovacao={aprovacao.geral} />

          <section className="panel p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <div className="label-caps">aprovação por segmento eleitoral</div>
              <div className="text-xs text-graphite-600">ordenado do mais forte ao mais fraco</div>
            </div>

            <div className="space-y-4">
              {ordenados.map((seg) => (
                <SegmentBar
                  key={seg.id}
                  segmentoId={seg.id}
                  valor={aprovacao.porSegmento[seg.id]}
                  delta={campanha.modificadores[seg.id] ?? null}
                  mostrarPeso
                />
              ))}
            </div>
          </section>

          {/* Decomposição: por que o pior segmento está ruim */}
          <section className="panel p-5">
            <div className="label-caps mb-3">por que {pior.nome} está no seu pior número</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['piso do segmento', aprovacao.detalhes[pior.id].base],
                ['alinhamento ideológico', aprovacao.detalhes[pior.id].ideologia],
                ['atributos do candidato', aprovacao.detalhes[pior.id].atributos],
                ['rejeição', aprovacao.detalhes[pior.id].rejeicao],
                ['coligação', aprovacao.detalhes[pior.id].coalizao],
                ['racha de base', aprovacao.detalhes[pior.id].racha],
                ['debates e eventos', aprovacao.detalhes[pior.id].eventos],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex items-baseline justify-between border-b border-graphite-800/60 py-1">
                  <span className="text-xs text-graphite-500">{rotulo}</span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      valor > 0 ? 'text-calm' : valor < 0 ? 'text-alarm' : 'text-graphite-600'
                    }`}
                  >
                    {valor > 0 ? '+' : ''}
                    {valor}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------- lateral */}
        <aside className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
          <StatTile
            rotulo="aprovação geral ponderada"
            valor={aprovacao.geral}
            sufixo="%"
            tom={tomGeral}
            nota={
              aprovacao.geral >= 50
                ? 'Eleito em turno único se a eleição fosse hoje.'
                : aprovacao.geral >= 35
                  ? 'Passaria para o segundo turno.'
                  : 'Derrotado ainda no primeiro turno.'
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <StatTile rotulo="overall" valor={overall} />
            <StatTile
              rotulo="rejeição"
              valor={attrs.rejeicao}
              tom={attrs.rejeicao > 65 ? 'ruim' : attrs.rejeicao > 45 ? 'atencao' : 'bom'}
            />
          </div>

          <div className="panel p-4">
            <div className="label-caps">perfil dominante</div>
            <div className="mt-1 font-display text-lg text-brass-300">{perfil.dominante.nome}</div>
            <p className="mt-2 text-xs leading-relaxed text-graphite-500">{perfil.dominante.bio}</p>
          </div>

          <div className="panel p-4">
            <div className="label-caps mb-2">leitura rápida</div>
            <ul className="space-y-2 text-xs leading-relaxed text-graphite-400">
              <li>
                <span className="text-calm">Mais forte:</span> {melhor.nome} ({aprovacao.porSegmento[melhor.id]}%)
              </li>
              <li>
                <span className="text-alarm">Mais fraco:</span> {pior.nome} ({aprovacao.porSegmento[pior.id]}%)
              </li>
              <li>
                <span className="text-graphite-300">Bancada aliada:</span> {aprovacao.coligacao.cadeirasTotais} cadeiras
              </li>
              {aprovacao.coligacao.rachaPenalidade > 0 && (
                <li className="text-alarm">
                  Racha de base custando {aprovacao.coligacao.rachaPenalidade} pts em{' '}
                  {aprovacao.coligacao.segmentoRachaNome}.
                </li>
              )}
            </ul>
          </div>

          <div className="panel p-4">
            <div className="label-caps mb-2">atributos herdados</div>
            <ul className="space-y-1">
              {Object.entries(attrs).map(([id, valor]) => (
                <li key={id} className="flex justify-between text-xs">
                  <span className="text-graphite-500">{ATTRIBUTE_BY_ID[id]?.nome}</span>
                  <span className="tabular-nums text-graphite-200">{Math.round(valor)}</span>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className="btn-ghost w-full" onClick={() => navigate('/campanha/partido')}>
            ← Ajustar coligação
          </button>
        </aside>
      </div>
    </Screen>
  );
}
