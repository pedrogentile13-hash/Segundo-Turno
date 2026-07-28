import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Screen, ScreenHeader, StepTrail } from '../components/Layout.jsx';
import AttributeCard from '../components/AttributeCard.jsx';
import { useGameStore } from '../store/gameStore.js';
import { ATTRIBUTE_IDS, ATTRIBUTE_BY_ID, effectiveValue } from '../data/attributes.js';
import { ARCHETYPE_BY_ID } from '../data/archetypes.js';
import { TOTAL_ROUNDS } from '../engine/draftEngine.js';
import { useSettingsStore } from '../store/settingsStore.js';

/**
 * Resumo lateral do candidato em construção.
 *
 * Enquanto o draft não termina, o overall exibido é PARCIAL: média só do que
 * já foi herdado. Usar a média dos 8 slots com os vazios valendo zero daria um
 * número sem sentido nas primeiras rodadas.
 */
function PainelCandidato({ escolhas, oculto, overall, completo }) {
  const parcial =
    escolhas.length === 0
      ? null
      : Math.round(
          escolhas.reduce((soma, e) => soma + effectiveValue(e.atributo, e.valor), 0) / escolhas.length,
        );
  const exibido = completo ? overall : parcial;

  return (
    <aside className="panel h-fit p-5 lg:sticky lg:top-8">
      <div className="flex items-baseline justify-between">
        <div className="label-caps">seu candidato</div>
        <div className="font-display text-3xl tabular-nums text-brass-300">
          {oculto ? '??' : (exibido ?? '—')}
        </div>
      </div>
      <p className="mt-1 text-xs text-graphite-500">
        {completo
          ? 'Overall (média dos 8 atributos, rejeição invertida)'
          : `Parcial sobre ${escolhas.length} de ${TOTAL_ROUNDS} atributos herdados`}
      </p>

      <ul className="mt-4 space-y-2">
        {ATTRIBUTE_IDS.map((id) => {
          const escolha = escolhas.find((e) => e.atributo === id);
          const attr = ATTRIBUTE_BY_ID[id];
          return (
            <li key={id} className="flex items-baseline justify-between gap-3 border-b border-graphite-800/70 pb-1.5">
              <div className="min-w-0">
                <div className={`truncate text-sm ${escolha ? 'text-graphite-200' : 'text-graphite-600'}`}>
                  {attr.nome}
                </div>
                {escolha && (
                  <div className="truncate text-[0.7rem] text-graphite-600">
                    de {ARCHETYPE_BY_ID[escolha.arquetipo]?.nome}
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 font-display text-lg tabular-nums ${
                  escolha ? 'text-graphite-100' : 'text-graphite-700'
                }`}
              >
                {escolha ? (oculto ? '••' : escolha.valor) : '—'}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default function CandidateDraft() {
  const navigate = useNavigate();

  const campanha = useGameStore((s) => s.campanha);
  const iniciarCampanha = useGameStore((s) => s.iniciarCampanha);
  const escolherAtributo = useGameStore((s) => s.escolherAtributo);
  const arquetipoAtual = useGameStore((s) => s.arquetipoAtual);
  const overallCandidato = useGameStore((s) => s.overallCandidato);
  const perfilDominante = useGameStore((s) => s.perfilDominante);

  const visibilidadeConfig = useSettingsStore((s) => s.visibilidadeDraft);

  // Entrou direto na URL sem passar pelo menu: inicia uma partida na hora.
  useEffect(() => {
    if (campanha.ordem.length === 0) iniciarCampanha(visibilidadeConfig);
  }, [campanha.ordem.length, visibilidadeConfig, iniciarCampanha]);

  const arquetipo = arquetipoAtual();
  const modoPro = campanha.visibilidade === 'pro';
  const concluido = campanha.draftCompleto;

  if (campanha.ordem.length === 0) return null;

  // -------------------------------------------------------------- fim do draft
  if (concluido) {
    const perfil = perfilDominante();
    return (
      <Screen>
        <StepTrail atual={0} />
        <ScreenHeader
          passo="draft concluído"
          titulo="Seu candidato está pronto"
          subtitulo="Os oito atributos foram herdados. Agora ele precisa de um partido e de gente disposta a subir no palanque com ele."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-6">
            <section className="panel p-6">
              <div className="label-caps">perfil dominante</div>
              <h2 className="mt-1 font-display text-2xl text-brass-300">{perfil.dominante.nome}</h2>
              <p className="mt-1 text-sm text-graphite-400">
                {perfil.dominante.epiteto} · afinidade de {perfil.ranking[0].afinidade}% com o arquétipo
              </p>
              <p className="mt-3 text-sm leading-relaxed text-graphite-400">{perfil.dominante.bio}</p>

              <div className="mt-5 space-y-2">
                <div className="label-caps">proximidade com os outros arquétipos</div>
                {perfil.ranking.slice(1, 4).map((r) => (
                  <div key={r.arquetipo.id} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 truncate text-xs text-graphite-400">{r.arquetipo.nome}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-graphite-800">
                      <div className="h-full rounded-full bg-graphite-500" style={{ width: `${r.afinidade}%` }} />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-graphite-500">
                      {r.afinidade}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel p-6">
              <div className="label-caps mb-3">de onde veio cada atributo</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {campanha.escolhas.map((e) => (
                  <div key={e.atributo} className="flex items-baseline justify-between gap-2 rounded border border-graphite-800 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-graphite-200">{ATTRIBUTE_BY_ID[e.atributo].nome}</div>
                      <div className="truncate text-[0.7rem] text-graphite-600">
                        rodada {e.rodada} · {ARCHETYPE_BY_ID[e.arquetipo]?.nome}
                      </div>
                    </div>
                    <span className="font-display text-xl tabular-nums text-brass-300">{e.valor}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => navigate('/campanha/partido')}>
                Montar partido e coligação →
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  iniciarCampanha(visibilidadeConfig);
                }}
              >
                Refazer draft
              </button>
            </div>
          </div>

          <PainelCandidato escolhas={campanha.escolhas} oculto={false} overall={overallCandidato()} completo />
        </div>
      </Screen>
    );
  }

  // ------------------------------------------------------------ rodada em curso
  return (
    <Screen>
      <StepTrail atual={0} />
      <ScreenHeader
        passo={`rodada ${campanha.rodada + 1} de ${TOTAL_ROUNDS}`}
        titulo="Draft de candidato"
        subtitulo="Herde UM atributo deste arquétipo. O que você escolher trava e não aparece mais nas próximas rodadas."
        acao={
          <div className="text-right">
            <div className="label-caps">visibilidade</div>
            <div className={`font-display text-lg ${modoPro ? 'text-alarm' : 'text-brass-300'}`}>
              {modoPro ? 'Pro — valores ocultos' : 'Normal'}
            </div>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <section className="panel p-6">
            <div className="label-caps text-brass-500">{arquetipo.era}</div>
            <h2 className="mt-1 font-display text-2xl text-graphite-100 sm:text-3xl">{arquetipo.nome}</h2>
            <p className="mt-0.5 text-sm text-brass-400">{arquetipo.epiteto}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite-400">{arquetipo.bio}</p>

            {!modoPro && (
              <div className="mt-4 flex flex-wrap gap-2">
                {arquetipo.forte.map((id) => (
                  <span key={id} className="rounded border border-calm/50 px-2 py-0.5 text-xs text-calm">
                    forte em {ATTRIBUTE_BY_ID[id].nome}
                  </span>
                ))}
                {arquetipo.fraco.map((id) => (
                  <span key={id} className="rounded border border-alarm/50 px-2 py-0.5 text-xs text-alarm">
                    fraco em {ATTRIBUTE_BY_ID[id].nome}
                  </span>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {ATTRIBUTE_IDS.map((id) => {
              const travado = campanha.escolhas.some((e) => e.atributo === id);
              return (
                <AttributeCard
                  key={id}
                  attrId={id}
                  valor={arquetipo.attrs[id]}
                  oculto={modoPro}
                  travado={travado}
                  destaque={arquetipo.forte.includes(id)}
                  onClick={() => escolherAtributo(id)}
                />
              );
            })}
          </div>

          <p className="text-xs text-graphite-600">
            Restam {TOTAL_ROUNDS - campanha.rodada} atributos para herdar.
            {modoPro && ' No modo Pro os valores só são revelados no fim do draft.'}
          </p>
        </div>

        <PainelCandidato escolhas={campanha.escolhas} oculto={modoPro} overall={overallCandidato()} completo={false} />
      </div>
    </Screen>
  );
}
