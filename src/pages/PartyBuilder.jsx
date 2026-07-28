import { useNavigate, Navigate } from 'react-router-dom';

import { Screen, ScreenHeader, StepTrail } from '../components/Layout.jsx';
import Slider from '../components/Slider.jsx';
import StatTile from '../components/StatTile.jsx';
import { useGameStore } from '../store/gameStore.js';
import { ALLY_PARTIES, MAX_ALLIES } from '../data/parties.js';
import { SEGMENT_BY_ID } from '../data/segments.js';
import { analyzeCoalition, axisDistance } from '../engine/approvalEngine.js';

/** Mapa 2D do espectro com o partido do jogador e os aliados escolhidos. */
function EspectroMapa({ eixosPartido, aliados }) {
  const pos = (eixos) => ({
    left: `${((eixos.economico + 100) / 200) * 100}%`,
    top: `${((100 - eixos.costumes) / 200) * 100}%`,
  });

  return (
    <div className="relative aspect-square w-full rounded-md border border-graphite-700 bg-graphite-950/60">
      <div className="absolute inset-x-0 top-1/2 h-px bg-graphite-800" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-graphite-800" />

      <span className="label-caps absolute left-2 top-1/2 -translate-y-1/2 text-graphite-700">estatismo</span>
      <span className="label-caps absolute right-2 top-1/2 -translate-y-1/2 text-graphite-700">liberalismo</span>
      <span className="label-caps absolute left-1/2 top-2 -translate-x-1/2 text-graphite-700">progressista</span>
      <span className="label-caps absolute bottom-2 left-1/2 -translate-x-1/2 text-graphite-700">conservador</span>

      {aliados.map((a) => (
        <div
          key={a.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={pos(a.eixos)}
          title={`${a.sigla} — ${a.nome}`}
        >
          <div className="h-2.5 w-2.5 rounded-full border border-graphite-950 bg-graphite-400" />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.65rem] text-graphite-400">
            {a.sigla}
          </span>
        </div>
      ))}

      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(eixosPartido)}>
        <div className="h-4 w-4 rounded-full border-2 border-graphite-950 bg-brass-400 shadow-lg shadow-black/50" />
      </div>
    </div>
  );
}

export default function PartyBuilder() {
  const navigate = useNavigate();

  const campanha = useGameStore((s) => s.campanha);
  const definirEixos = useGameStore((s) => s.definirEixos);
  const alternarAliado = useGameStore((s) => s.alternarAliado);
  const confirmarPartido = useGameStore((s) => s.confirmarPartido);
  const aliados = useGameStore((s) => s.aliados)();

  if (!campanha.draftCompleto) return <Navigate to="/campanha/draft" replace />;

  const { eixosPartido, aliadosIds } = campanha;
  const coligacao = analyzeCoalition(eixosPartido, aliados);
  const segmentoRacha = coligacao.segmentoRacha ? SEGMENT_BY_ID[coligacao.segmentoRacha] : null;

  return (
    <Screen>
      <StepTrail atual={1} />
      <ScreenHeader
        passo="passo 2"
        titulo="Partido e coligação"
        subtitulo="Posicione seu partido nos dois eixos e escolha até três aliados. Coligação larga rende bancada — e racha a sua própria base."
      />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        {/* ---------------------------------------------------- eixos + mapa */}
        <div className="space-y-5">
          <section className="panel space-y-6 p-5">
            <div className="label-caps">posição do seu partido</div>

            <Slider
              label="Eixo econômico"
              valor={eixosPartido.economico}
              min={-100}
              max={100}
              sufixo=""
              esquerda="estatismo"
              direita="liberalismo"
              onChange={(v) => definirEixos({ ...eixosPartido, economico: v })}
            />

            <Slider
              label="Eixo de costumes"
              valor={eixosPartido.costumes}
              min={-100}
              max={100}
              sufixo=""
              esquerda="conservador"
              direita="progressista"
              onChange={(v) => definirEixos({ ...eixosPartido, costumes: v })}
            />

            <EspectroMapa eixosPartido={eixosPartido} aliados={aliados} />
          </section>

          <div className="grid grid-cols-2 gap-3">
            <StatTile
              rotulo="bancada aliada"
              valor={coligacao.cadeirasTotais}
              nota={`+${coligacao.bonusBancada} de governabilidade`}
              tom={coligacao.cadeirasTotais > 120 ? 'bom' : 'neutro'}
            />
            <StatTile
              rotulo="racha de base"
              valor={coligacao.rachaPenalidade}
              sufixo=" pts"
              tom={coligacao.rachaPenalidade > 10 ? 'ruim' : coligacao.rachaPenalidade > 0 ? 'atencao' : 'bom'}
              nota={segmentoRacha ? `perdidos em ${segmentoRacha.nome}` : 'coligação coesa'}
            />
          </div>

          {coligacao.rachaPenalidade > 0 && (
            <div className="panel border-alarm/40 bg-alarm/5 p-4">
              <div className="label-caps text-alarm">alerta de coligação</div>
              <p className="mt-1 text-sm leading-relaxed text-graphite-300">
                A distância ideológica entre os membros do palanque chegou a{' '}
                <strong className="text-alarm">{Math.round(coligacao.distanciaMax * 100)}%</strong> do espectro.
                Sua base mais fiel — {coligacao.segmentoRachaNome} — vai cobrar essa conta:{' '}
                <strong className="text-alarm">−{coligacao.rachaPenalidade} pontos</strong> de aprovação nesse
                segmento.
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------- aliados */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="label-caps">partidos aliados</div>
            <span className="text-sm text-graphite-400">
              {aliadosIds.length} de {MAX_ALLIES} escolhidos
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ALLY_PARTIES.map((p) => {
              const selecionado = aliadosIds.includes(p.id);
              const cheio = aliadosIds.length >= MAX_ALLIES && !selecionado;
              const distancia = Math.round(axisDistance(eixosPartido, p.eixos) * 100);

              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={cheio}
                  onClick={() => alternarAliado(p.id)}
                  className={[
                    'panel p-4 text-left transition-all',
                    selecionado ? 'border-brass-600 bg-brass-600/10' : 'panel-hover',
                    cheio ? 'cursor-not-allowed opacity-35' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`font-display text-xl ${selecionado ? 'text-brass-300' : 'text-graphite-100'}`}>
                      {p.sigla}
                    </span>
                    <span className="text-xs tabular-nums text-graphite-500">{p.cadeiras} cadeiras</span>
                  </div>

                  <div className="mt-0.5 text-sm text-graphite-300">{p.nome}</div>
                  <div className="mt-1 text-xs italic text-graphite-500">“{p.lema}”</div>

                  <dl className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-graphite-600">distância de você</dt>
                      <dd className={distancia > 45 ? 'text-alarm' : distancia > 25 ? 'text-brass-400' : 'text-calm'}>
                        {distancia}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-graphite-600">fidelidade</dt>
                      <dd className={p.fidelidade < 0.4 ? 'text-alarm' : 'text-graphite-300'}>
                        {Math.round(p.fidelidade * 100)}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-graphite-600">puxa</dt>
                      <dd className="text-graphite-300">{SEGMENT_BY_ID[p.segmentoForte]?.nome}</dd>
                    </div>
                  </dl>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                confirmarPartido();
                navigate('/campanha/aprovacao');
              }}
            >
              Ver painel de aprovação →
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/campanha/draft')}>
              ← Voltar ao draft
            </button>
          </div>

          <p className="text-xs leading-relaxed text-graphite-600">
            Aliado de fidelidade baixa aumenta a chance de traição se a campanha desabar abaixo de 35%.
          </p>
        </div>
      </div>
    </Screen>
  );
}
