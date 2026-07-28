import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Screen, ScreenHeader } from '../components/Layout.jsx';
import { useSettingsStore, OPCOES_TIMER } from '../store/settingsStore.js';
import { useGameStore, temCampanhaEmAndamento } from '../store/gameStore.js';
import { VISIBILITY_MODES } from '../engine/draftEngine.js';

/** Grupo de opções mutuamente exclusivas. */
function Escolha({ titulo, descricao, opcoes, valor, onChange }) {
  return (
    <section className="panel p-5">
      <div className="label-caps">{titulo}</div>
      {descricao && <p className="mt-1 text-xs leading-relaxed text-graphite-500">{descricao}</p>}

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {opcoes.map((o) => {
          const ativo = valor === o.valor;
          return (
            <button
              key={String(o.valor)}
              type="button"
              onClick={() => onChange(o.valor)}
              aria-pressed={ativo}
              className={[
                'rounded-md border px-3 py-3 text-left transition-colors',
                ativo ? 'border-brass-600 bg-brass-600/10' : 'border-graphite-700 hover:border-graphite-500',
              ].join(' ')}
            >
              <div className={`text-sm font-semibold ${ativo ? 'text-brass-300' : 'text-graphite-200'}`}>
                {o.nome}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-graphite-500">{o.descricao}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Interruptor booleano. */
function Interruptor({ titulo, descricao, ativo, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      onClick={() => onChange(!ativo)}
      className="panel flex w-full items-start gap-4 p-5 text-left transition-colors hover:border-graphite-600"
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-graphite-100">{titulo}</div>
        <p className="mt-1 text-xs leading-relaxed text-graphite-500">{descricao}</p>
      </div>
      <span
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          ativo ? 'bg-brass-600' : 'bg-graphite-700'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-graphite-950 transition-transform ${
            ativo ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const s = useSettingsStore();
  const campanha = useGameStore((g) => g.campanha);
  const regime = useGameStore((g) => g.regime);
  const apagarProgresso = useGameStore((g) => g.apagarProgresso);

  const [confirmandoApagar, setConfirmandoApagar] = useState(false);

  const temProgresso = temCampanhaEmAndamento(campanha) || !!regime;

  return (
    <Screen largura="max-w-2xl">
      <ScreenHeader
        passo="ajustes"
        titulo="Configurações"
        subtitulo="Valem para todas as partidas e ficam salvas neste aparelho."
      />

      <div className="space-y-4">
        <Interruptor
          titulo="Mostrar o tom de cada resposta no debate"
          descricao="Com isso ligado, o rótulo (técnico, emocional, valores…) aparece embaixo de cada opção e basta casar com a linha editorial da emissora. Desligado, você precisa ler o tom pelo texto — é o modo como o minigame foi pensado."
          ativo={s.mostrarTomDebate}
          onChange={(v) => s.definir('mostrarTomDebate', v)}
        />

        <Escolha
          titulo="Visibilidade do draft"
          descricao="Define se os valores dos atributos aparecem antes da escolha."
          valor={s.visibilidadeDraft}
          onChange={(v) => s.definir('visibilidadeDraft', v)}
          opcoes={VISIBILITY_MODES.map((m) => ({ valor: m.id, nome: m.nome, descricao: m.descricao }))}
        />

        <Escolha
          titulo="Tempo por pergunta no debate"
          valor={s.segundosDebate}
          onChange={(v) => s.definir('segundosDebate', v)}
          opcoes={OPCOES_TIMER}
        />

        <Interruptor
          titulo="Reduzir animações"
          descricao="Corta transições, a animação de barras e a tela de abertura. Útil em aparelho mais fraco ou se movimento na tela te incomoda."
          ativo={s.animacoesReduzidas}
          onChange={(v) => s.definir('animacoesReduzidas', v)}
        />

        <Interruptor
          titulo="Pular tela de abertura"
          descricao="Abre direto no menu, sem a animação de carregamento."
          ativo={s.pularAbertura}
          onChange={(v) => s.definir('pularAbertura', v)}
        />

        {/* ------------------------------------------------------- dados */}
        <section className="panel p-5">
          <div className="label-caps">dados salvos neste aparelho</div>
          <p className="mt-1 text-xs leading-relaxed text-graphite-500">
            A partida em andamento e estas configurações ficam no armazenamento local do navegador.
            Nada é enviado para lugar nenhum.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-ghost" onClick={s.restaurarPadroes}>
              Restaurar padrões
            </button>

            {!confirmandoApagar ? (
              <button
                type="button"
                className="btn-danger"
                disabled={!temProgresso}
                onClick={() => setConfirmandoApagar(true)}
              >
                Apagar partida em andamento
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-alarm">Apagar a partida dos dois modos?</span>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    apagarProgresso();
                    setConfirmandoApagar(false);
                  }}
                >
                  Apagar
                </button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmandoApagar(false)}>
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {!temProgresso && (
            <p className="mt-2 text-xs text-graphite-600">Não há partida em andamento para apagar.</p>
          )}
        </section>

        <button type="button" className="btn-ghost w-full py-3" onClick={() => navigate('/menu')}>
          ← Voltar ao menu
        </button>
      </div>
    </Screen>
  );
}
