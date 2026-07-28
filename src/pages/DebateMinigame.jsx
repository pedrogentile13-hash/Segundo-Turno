import { useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

import { Screen, ScreenHeader, StepTrail } from '../components/Layout.jsx';
import Timer from '../components/Timer.jsx';
import SegmentBar from '../components/SegmentBar.jsx';
import StatTile from '../components/StatTile.jsx';
import { useGameStore } from '../store/gameStore.js';
import { BROADCASTERS, BROADCASTER_BY_ID, TONES, PERGUNTAS_POR_DEBATE } from '../data/broadcasters.js';
import { SEGMENT_BY_ID } from '../data/segments.js';
import { scoreAnswer, timeoutAnswer, runDebate, debateVerdict, drawQuestions } from '../engine/debateEngine.js';
import { useSettingsStore } from '../store/settingsStore.js';

/** Lista compacta de impactos por segmento. */
function ListaImpactos({ impactos, titulo = 'impacto por segmento' }) {
  const entradas = Object.entries(impactos).sort((a, b) => b[1] - a[1]);
  if (entradas.length === 0) {
    return <p className="text-xs text-graphite-500">Nenhum segmento se moveu com essa resposta.</p>;
  }

  return (
    <div>
      <div className="label-caps mb-2">{titulo}</div>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {entradas.map(([segId, valor]) => (
          <div key={segId} className="flex items-baseline justify-between gap-2 border-b border-graphite-800/60 py-1">
            <span className="truncate text-xs text-graphite-400">{SEGMENT_BY_ID[segId]?.nome ?? segId}</span>
            <span className={`shrink-0 text-sm font-semibold tabular-nums ${valor > 0 ? 'text-calm' : 'text-alarm'}`}>
              {valor > 0 ? '+' : ''}
              {valor.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Fase 1 — escolha da emissora
// ===========================================================================
function SelecaoEmissora({ feitos, onEscolher, onFinalizar }) {
  const restantes = BROADCASTERS.filter((b) => !feitos.includes(b.id));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BROADCASTERS.map((b) => {
          const jaFoi = feitos.includes(b.id);
          return (
            <article
              key={b.id}
              className={`panel flex flex-col p-5 ${jaFoi ? 'opacity-45' : 'panel-hover'}`}
            >
              <div className="label-caps text-brass-500">{b.perfil}</div>
              <h2 className="mt-1 font-display text-2xl text-graphite-100">{b.nome}</h2>
              <p className="text-xs italic text-graphite-500">“{b.slogan}”</p>
              <p className="mt-1 text-xs text-graphite-400">Apresentação: {b.apresentador}</p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite-400">{b.descricao}</p>

              <div className="mt-4 space-y-2">
                <div>
                  <span className="label-caps text-calm">premia</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {b.tonsBonus.map((t) => (
                      <span key={t} className="rounded border border-calm/40 px-2 py-0.5 text-xs text-calm">
                        {TONES[t].nome}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="label-caps text-alarm">vira gafe viral</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {b.tonsGafe.map((t) => (
                      <span key={t} className="rounded border border-alarm/40 px-2 py-0.5 text-xs text-alarm">
                        {TONES[t].nome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={jaFoi}
                onClick={() => onEscolher(b.id)}
                className={jaFoi ? 'btn-ghost mt-5 w-full' : 'btn-primary mt-5 w-full'}
              >
                {jaFoi ? 'Debate já realizado' : `Entrar no estúdio (${PERGUNTAS_POR_DEBATE} perguntas)`}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={onFinalizar}>
          {restantes.length > 0 ? 'Encerrar campanha e apurar →' : 'Apurar a eleição →'}
        </button>
        {restantes.length > 0 && (
          <span className="text-xs text-graphite-500">
            Ainda dá para fazer {restantes.length} debate{restantes.length > 1 ? 's' : ''}. Pular custa exposição.
          </span>
        )}
      </div>
    </>
  );
}

// ===========================================================================
// Fase 2 — debate em andamento
// ===========================================================================
function Debate({ broadcasterId, perguntas, indice, respostas, onResponder, onAvancar, ultimaReacao, mostrarTom, segundos }) {
  const emissora = BROADCASTER_BY_ID[broadcasterId];
  const pergunta = perguntas[indice];
  const aguardandoAvanco = ultimaReacao !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="min-w-0 space-y-5">
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="label-caps text-brass-500">{pergunta.tema}</div>
            <div className="text-xs text-graphite-500">
              pergunta {indice + 1} de {perguntas.length}
            </div>
          </div>

          <p className="mt-3 font-display text-lg leading-relaxed text-graphite-100 sm:text-xl">{pergunta.texto}</p>
          <p className="mt-2 text-xs text-graphite-500">— {emissora.apresentador}, {emissora.nome}</p>
        </section>

        {!aguardandoAvanco ? (
          <div className="space-y-3">
            {pergunta.opcoes.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => onResponder(opcao)}
                className="panel panel-hover w-full p-4 text-left"
              >
                <p className="text-sm leading-relaxed text-graphite-200">{opcao.texto}</p>
                {mostrarTom && (
                  <span className="label-caps mt-2 inline-block text-graphite-600">
                    tom {TONES[opcao.tom].nome}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <section
            className={`panel p-5 ${
              ultimaReacao.gafe ? 'border-alarm/60 bg-alarm/5' : ultimaReacao.alinhado ? 'border-calm/50 bg-calm/5' : ''
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className={`label-caps ${ultimaReacao.gafe ? 'text-alarm' : ultimaReacao.alinhado ? 'text-calm' : ''}`}>
                {ultimaReacao.timeout
                  ? 'tempo esgotado'
                  : ultimaReacao.gafe
                    ? 'gafe viral'
                    : ultimaReacao.alinhado
                      ? 'no tom da casa'
                      : 'resposta registrada'}
              </div>
              <div className="text-xs text-graphite-500">tom {TONES[ultimaReacao.tom]?.nome}</div>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-graphite-300">{ultimaReacao.mensagem}</p>

            <div className="mt-4">
              <ListaImpactos impactos={ultimaReacao.impactos} />
            </div>

            <button type="button" className="btn-primary mt-5" onClick={onAvancar}>
              {indice + 1 < perguntas.length ? 'Próxima pergunta →' : 'Ver saldo do debate →'}
            </button>
          </section>
        )}
      </div>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-8 lg:h-fit">
        <div className="panel p-4">
          <div className="label-caps">{emissora.perfil}</div>
          <div className="mt-1 font-display text-xl text-graphite-100">{emissora.nome}</div>
          <p className="mt-2 text-xs leading-relaxed text-graphite-500">{emissora.descricao}</p>
        </div>

        <div className="panel p-4">
          <Timer
            segundos={segundos}
            chave={`${broadcasterId}-${indice}`}
            pausado={aguardandoAvanco}
            onExpirar={() => onResponder(timeoutAnswer())}
          />
          <p className="mt-2 text-xs leading-snug text-graphite-500">
            Sem resposta no tempo, o silêncio entra no ar como resposta neutra fraca.
          </p>
        </div>

        <div className="panel p-4">
          <div className="label-caps mb-2">linha editorial</div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-calm">premia:</span>{' '}
              <span className="text-graphite-300">{emissora.tonsBonus.map((t) => TONES[t].nome).join(', ')}</span>
            </div>
            <div>
              <span className="text-alarm">gafe:</span>{' '}
              <span className="text-graphite-300">{emissora.tonsGafe.map((t) => TONES[t].nome).join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="panel p-4">
          <div className="label-caps mb-2">respostas até aqui</div>
          <div className="flex flex-wrap gap-1.5">
            {perguntas.map((p, i) => {
              const r = respostas[i];
              return (
                <span
                  key={p.id}
                  className={[
                    'h-2.5 w-2.5 rounded-full',
                    !r ? 'bg-graphite-700' : r.gafe ? 'bg-alarm' : r.alinhado ? 'bg-calm' : 'bg-brass-500',
                  ].join(' ')}
                  title={p.tema}
                />
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ===========================================================================
// Página
// ===========================================================================
export default function DebateMinigame() {
  const navigate = useNavigate();

  const campanha = useGameStore((s) => s.campanha);
  const registrarDebate = useGameStore((s) => s.registrarDebate);
  const sortearEvento = useGameStore((s) => s.sortearEvento);
  const aprovacao = useGameStore((s) => s.aprovacao)();

  const mostrarTom = useSettingsStore((s) => s.mostrarTomDebate);
  const segundosDebate = useSettingsStore((s) => s.segundosDebate);

  const [fase, setFase] = useState('selecao'); // selecao | debate | resumo | evento
  const [emissoraAtiva, setEmissoraAtiva] = useState(null);
  const [perguntas, setPerguntas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [ultimaReacao, setUltimaReacao] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [evento, setEvento] = useState(null);

  const feitos = campanha.debatesFeitos.map((d) => d.broadcasterId);

  const responder = useCallback(
    (opcao) => {
      if (ultimaReacao) return; // já respondeu esta pergunta
      const resultado = scoreAnswer(emissoraAtiva, opcao);
      const emissora = BROADCASTER_BY_ID[emissoraAtiva];

      const mensagem = opcao.timeout
        ? 'O tempo acabou no meio do raciocínio. O corte de dez segundos de silêncio já está circulando.'
        : resultado.gafe
          ? `Tom errado para a ${emissora.nome}. O estúdio inteiro percebeu, e o trecho vai viralizar contra você.`
          : resultado.alinhado
            ? `Exatamente o que a ${emissora.nome} queria ouvir. A audiência da casa comprou.`
            : 'Resposta correta de conteúdo, morna de entrega. Nem ajudou muito, nem atrapalhou.';

      setUltimaReacao({ ...resultado, mensagem, timeout: !!opcao.timeout, opcao });
      setRespostas((atual) => {
        const proximo = [...atual];
        proximo[indice] = { ...resultado, opcao, perguntaId: perguntas[indice].id, broadcasterId: emissoraAtiva };
        return proximo;
      });
    },
    [emissoraAtiva, indice, perguntas, ultimaReacao],
  );

  const avancar = useCallback(() => {
    setUltimaReacao(null);

    if (indice + 1 < perguntas.length) {
      setIndice(indice + 1);
      return;
    }

    // Fim do debate: consolida, registra e sorteia um evento de campanha.
    const consolidado = runDebate(
      respostas.map((r) => ({ broadcasterId: emissoraAtiva, perguntaId: r.perguntaId, opcao: r.opcao })),
    );
    registrarDebate(emissoraAtiva, consolidado);
    setResumo(consolidado);
    setFase('resumo');
  }, [emissoraAtiva, indice, perguntas, respostas, registrarDebate]);

  const iniciarDebate = (broadcasterId) => {
    // A seed junta a partida e a emissora: o sorteio é estável se o jogador
    // voltar, mas muda de uma partida para outra.
    setPerguntas(drawQuestions(broadcasterId, campanha.seed + broadcasterId.length * 7717));
    setEmissoraAtiva(broadcasterId);
    setIndice(0);
    setRespostas([]);
    setUltimaReacao(null);
    setResumo(null);
    setFase('debate');
  };

  const seguirDoResumo = () => {
    const sorteado = sortearEvento();
    if (sorteado) {
      setEvento(sorteado);
      setFase('evento');
    } else {
      setFase('selecao');
    }
  };

  if (!campanha.draftCompleto) return <Navigate to="/campanha/draft" replace />;

  // ------------------------------------------------------------------ header
  const cabecalho = {
    selecao: {
      passo: `passo 4 · ${feitos.length} de ${BROADCASTERS.length} debates feitos`,
      titulo: 'Debates ao vivo',
      subtitulo:
        'Cada emissora tem linha editorial própria. Responder fora do tom da casa não é só perder ponto: vira gafe viral e espalha o estrago por toda a audiência do canal.',
    },
    debate: {
      passo: 'debate em andamento',
      titulo: BROADCASTER_BY_ID[emissoraAtiva]?.nome ?? 'Debate',
      subtitulo: 'Dez segundos por pergunta. Sem resposta, o silêncio conta como resposta neutra fraca.',
    },
    resumo: { passo: 'fim do debate', titulo: 'Saldo do debate', subtitulo: null },
    evento: { passo: 'entre os debates', titulo: 'Aconteceu na campanha', subtitulo: null },
  }[fase];

  return (
    <Screen>
      <StepTrail atual={3} />
      <ScreenHeader
        passo={cabecalho.passo}
        titulo={cabecalho.titulo}
        subtitulo={cabecalho.subtitulo}
        acao={
          fase === 'selecao' && (
            <StatTile rotulo="aprovação geral" valor={aprovacao.geral} sufixo="%" tom={aprovacao.geral >= 50 ? 'bom' : aprovacao.geral >= 35 ? 'atencao' : 'ruim'} />
          )
        }
      />

      {fase === 'selecao' && (
        <SelecaoEmissora
          feitos={feitos}
          onEscolher={iniciarDebate}
          onFinalizar={() => navigate('/campanha/resultado')}
        />
      )}

      {fase === 'debate' && (
        <Debate
          broadcasterId={emissoraAtiva}
          perguntas={perguntas}
          indice={indice}
          respostas={respostas}
          onResponder={responder}
          onAvancar={avancar}
          ultimaReacao={ultimaReacao}
          mostrarTom={mostrarTom}
          segundos={segundosDebate}
        />
      )}

      {fase === 'resumo' && resumo && (
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <section className="panel p-6">
            <p className="font-display text-xl leading-relaxed text-graphite-100">
              {debateVerdict(resumo, perguntas.length)}
            </p>

            <div className="mt-6">
              <ListaImpactos impactos={resumo.impactos} titulo="saldo acumulado do debate" />
            </div>

            <button type="button" className="btn-primary mt-6" onClick={seguirDoResumo}>
              Continuar campanha →
            </button>
          </section>

          <aside className="space-y-3">
            <StatTile
              rotulo="saldo do debate"
              valor={resumo.saldo > 0 ? `+${resumo.saldo}` : resumo.saldo}
              tom={resumo.saldo > 0 ? 'bom' : 'ruim'}
            />
            <StatTile rotulo="acertos de tom" valor={`${resumo.acertosDeTom}/${perguntas.length}`} tom="atencao" />
            <StatTile rotulo="gafes virais" valor={resumo.gafes} tom={resumo.gafes > 0 ? 'ruim' : 'bom'} />
          </aside>
        </div>
      )}

      {fase === 'evento' && evento && (
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <section
            className={`panel p-6 ${evento.evento.base < 0 ? 'border-alarm/50 bg-alarm/5' : 'border-calm/50 bg-calm/5'}`}
          >
            <div className={`label-caps ${evento.evento.base < 0 ? 'text-alarm' : 'text-calm'}`}>
              {evento.evento.categoria}
            </div>
            <h2 className="mt-1 font-display text-2xl leading-snug text-graphite-100">{evento.evento.manchete}</h2>
            <p className="mt-3 text-sm leading-relaxed text-graphite-300">{evento.evento.texto}</p>

            <div className="mt-4 rounded border border-graphite-700 bg-graphite-950/40 p-3">
              <div className="label-caps mb-1">como isso bateu em você</div>
              <p className="text-sm text-graphite-300">{evento.resumo}</p>
              <p className="mt-1 text-xs text-graphite-500">
                Fator de impacto aplicado ao seu perfil: <span className="tabular-nums">{evento.fator}×</span>
              </p>
            </div>

            <div className="mt-5">
              <ListaImpactos impactos={evento.impactos} />
            </div>

            <button
              type="button"
              className="btn-primary mt-6"
              onClick={() => {
                setEvento(null);
                setFase('selecao');
              }}
            >
              Seguir em frente →
            </button>
          </section>

          <aside className="space-y-4">
            <div className="panel p-4">
              <div className="label-caps mb-3">aprovação depois do evento</div>
              <div className="space-y-3">
                {Object.keys(evento.impactos)
                  .slice(0, 5)
                  .map((segId) => (
                    <SegmentBar key={segId} segmentoId={segId} valor={aprovacao.porSegmento[segId]} compacto />
                  ))}
              </div>
            </div>
            {evento.aliadoRemovido && (
              <div className="panel border-alarm/50 p-4">
                <div className="label-caps text-alarm">coligação alterada</div>
                <p className="mt-1 text-sm text-graphite-300">
                  {evento.aliadoRemovido.sigla} — {evento.aliadoRemovido.nome} deixou o palanque.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </Screen>
  );
}
