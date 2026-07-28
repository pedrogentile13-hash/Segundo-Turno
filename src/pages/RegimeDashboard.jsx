import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

import { Screen, ScreenHeader } from '../components/Layout.jsx';
import Slider from '../components/Slider.jsx';
import StatTile from '../components/StatTile.jsx';
import SegmentBar from '../components/SegmentBar.jsx';
import CriticalityChart from '../components/CriticalityChart.jsx';
import { useGameStore } from '../store/gameStore.js';
import { BUDGET_KEYS, BUDGET_LABELS } from '../data/regimes.js';
import { SEGMENTS } from '../data/segments.js';
import { availableActions, expandSimpleBudget } from '../engine/regimeEngine.js';

const NOTAS_ORCAMENTO = {
  educacao: 'Entrega permanente. Demora, mas nunca é desfeita.',
  saude: 'Entrega permanente e o alívio mais rápido da fome urbana.',
  defesa: 'Sustenta território e repressão — e é a linha mais cara do orçamento.',
  infraestrutura: 'Puxa produção e derruba fome. É o que mais mexe na arrecadação.',
  propaganda: 'Efeito imediato e temporário: decai 40% por turno se você parar.',
};

/**
 * Redistribui a diferença entre as outras linhas, proporcionalmente, para o
 * orçamento continuar somando 100.
 */
function redistribuir(orcamento, chave, novoValor) {
  const alvo = Math.max(0, Math.min(100, novoValor));
  const outras = BUDGET_KEYS.filter((k) => k !== chave);
  const somaOutras = outras.reduce((s, k) => s + orcamento[k], 0);
  const restante = 100 - alvo;

  const saida = { [chave]: alvo };
  if (somaOutras <= 0) {
    outras.forEach((k) => {
      saida[k] = restante / outras.length;
    });
  } else {
    outras.forEach((k) => {
      saida[k] = (orcamento[k] / somaOutras) * restante;
    });
  }

  BUDGET_KEYS.forEach((k) => {
    saida[k] = Math.round(saida[k] * 10) / 10;
  });
  return saida;
}

export default function RegimeDashboard() {
  const navigate = useNavigate();

  const regime = useGameStore((s) => s.regime);
  const orcamento = useGameStore((s) => s.orcamentoRascunho);
  const imposto = useGameStore((s) => s.impostoRascunho);
  const acao = useGameStore((s) => s.acaoRascunho);
  const definirOrcamento = useGameStore((s) => s.definirOrcamento);
  const definirImposto = useGameStore((s) => s.definirImposto);
  const definirAcao = useGameStore((s) => s.definirAcao);
  const confirmarTurno = useGameStore((s) => s.confirmarTurno);
  const previewRegime = useGameStore((s) => s.previewRegime);

  // Controles simplificados do modo Fácil.
  const [simples, setSimples] = useState({ defesa: 30, social: 55 });

  const preview = previewRegime();

  // Modo Fácil: os dois controles alimentam a repartição completa.
  useEffect(() => {
    if (regime?.dificuldadeId !== 'facil') return;
    definirOrcamento(expandSimpleBudget({ defesa: simples.defesa, social: simples.social, propaganda: 15 }));
  }, [regime?.dificuldadeId, simples, definirOrcamento]);

  const acoes = useMemo(() => (regime ? availableActions(regime) : []), [regime]);

  if (!regime) return <Navigate to="/regime" replace />;
  if (regime.fim) return <Navigate to="/regime/resultado" replace />;
  if (!preview) return null;

  const { dificuldade, economia, critico, aprovacao, indice } = preview;
  const regimeData = preview.regime;
  const modoFacil = regime.dificuldadeId === 'facil';

  const deltaCriticidade = critico.criticidade - regime.criticidade;
  const tomCriticidade = critico.criticidade >= 80 ? 'ruim' : critico.criticidade >= 55 ? 'atencao' : 'bom';

  const avancar = () => {
    const proximo = confirmarTurno();
    if (proximo?.fim) navigate('/regime/resultado');
  };

  return (
    <Screen>
      <ScreenHeader
        passo={`${regimeData.nome} · ${dificuldade.nome}`}
        titulo={
          regime.dificuldadeId === 'dificil'
            ? `Ano ${regime.ano} de ${dificuldade.turnos}`
            : `Turno ${regime.turno + 1} de ${dificuldade.turnos}`
        }
        subtitulo="Os números à direita são projeção: mostram o que acontece se você confirmar o turno com este orçamento."
        acao={
          <button type="button" className="btn-primary" onClick={avancar}>
            Confirmar turno →
          </button>
        }
      />

      {/* ------------------------------------------------ evento do turno anterior */}
      {regime.ultimoEvento && (
        <div className="panel mb-6 border-brass-600/50 bg-brass-700/5 p-4">
          <div className="flex items-start gap-3">
            <span className="font-display text-2xl text-brass-400">{regime.ultimoEvento.icone}</span>
            <div>
              <div className="label-caps text-brass-400">evento do turno anterior · {regime.ultimoEvento.nome}</div>
              <p className="mt-1 text-sm leading-relaxed text-graphite-300">{regime.ultimoEvento.texto}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        {/* ============================================ coluna de controles */}
        <div className="space-y-5">
          <section className="panel space-y-5 p-5">
            <div className="flex items-baseline justify-between">
              <div className="label-caps">orçamento — sempre 100%</div>
              <span className="text-xs text-graphite-600">{modoFacil ? '2 controles' : '5 controles'}</span>
            </div>

            {modoFacil ? (
              <>
                <Slider
                  label="Defesa"
                  valor={simples.defesa}
                  max={100 - simples.social}
                  nota="No modo Fácil o resto do orçamento se distribui sozinho."
                  onChange={(v) => setSimples((s) => ({ ...s, defesa: v }))}
                />
                <Slider
                  label="Social (educação, saúde e infraestrutura)"
                  valor={simples.social}
                  max={100 - simples.defesa}
                  nota="Converte-se em entrega permanente, que derruba criticidade para sempre."
                  onChange={(v) => setSimples((s) => ({ ...s, social: v }))}
                />
                <div className="rounded border border-graphite-800 bg-graphite-950/40 p-3">
                  <div className="label-caps mb-2">repartição resultante</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {BUDGET_KEYS.map((k) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-graphite-500">{BUDGET_LABELS[k]}</span>
                        <span className="tabular-nums text-graphite-300">{orcamento[k]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              BUDGET_KEYS.map((k) => (
                <Slider
                  key={k}
                  label={BUDGET_LABELS[k]}
                  valor={orcamento[k]}
                  nota={NOTAS_ORCAMENTO[k]}
                  onChange={(v) => definirOrcamento(redistribuir(orcamento, k, v))}
                />
              ))
            )}
          </section>

          <section className="panel space-y-4 p-5">
            <div className="label-caps">carga tributária</div>
            <Slider
              label="Alíquota efetiva"
              valor={imposto}
              onChange={definirImposto}
              esquerda="baixa arrecadação"
              direita="alta evasão"
              nota={`Padrão deste sistema: ${regimeData.params.impostoPadrao}%. Alíquota muito alta perde eficiência de cobrança.`}
            />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="label-caps">arrecada</div>
                <div className="font-display text-lg tabular-nums text-calm">{economia.arrecadacao}</div>
              </div>
              <div>
                <div className="label-caps">gasta</div>
                <div className="font-display text-lg tabular-nums text-graphite-200">{economia.gastoTotal}</div>
              </div>
              <div>
                <div className="label-caps">déficit</div>
                <div
                  className={`font-display text-lg tabular-nums ${economia.deficit > 0 ? 'text-alarm' : 'text-calm'}`}
                >
                  {economia.deficit > 0 ? '+' : ''}
                  {economia.deficit}
                </div>
              </div>
            </div>
          </section>

          {acoes.length > 1 && (
            <section className="panel space-y-2 p-5">
              <div className="label-caps mb-1">ação do turno</div>
              {acoes.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => definirAcao(a.id)}
                  className={[
                    'w-full rounded border px-3 py-2 text-left transition-colors',
                    acao === a.id ? 'border-brass-600 bg-brass-600/10' : 'border-graphite-700 hover:border-graphite-500',
                  ].join(' ')}
                >
                  <div className={`text-sm font-medium ${acao === a.id ? 'text-brass-300' : 'text-graphite-200'}`}>
                    {a.nome}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-graphite-500">{a.descricao}</div>
                </button>
              ))}
            </section>
          )}
        </div>

        {/* ============================================= coluna de indicadores */}
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              rotulo="criticidade da população"
              valor={critico.criticidade}
              tom={tomCriticidade}
              delta={Math.round(deltaCriticidade * 10) / 10}
              nota="100 = fim do regime"
            />
            <StatTile
              rotulo="inflação"
              valor={economia.inflacao}
              sufixo="%"
              tom={economia.inflacao > 25 ? 'ruim' : economia.inflacao > 10 ? 'atencao' : 'bom'}
              nota="Acima de 8% atravessa a propaganda"
            />
            <StatTile
              rotulo={regimeData.indicePrincipal.nome}
              valor={indice}
              tom="atencao"
              nota={regimeData.indicePrincipal.id === 'poder_militar' ? 'Sustenta o território ocupado' : 'Base da arrecadação'}
            />
            <StatTile
              rotulo="aprovação do regime"
              valor={aprovacao}
              sufixo="%"
              tom={aprovacao > 55 ? 'bom' : aprovacao > 30 ? 'atencao' : 'ruim'}
            />
          </div>

          {/* ------------------------------------------- decomposição da fórmula */}
          <section className="panel p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <div className="label-caps">de onde vem a criticidade deste turno</div>
              <div className="text-xs tabular-nums text-graphite-500">
                variação {deltaCriticidade > 0 ? '+' : ''}
                {deltaCriticidade.toFixed(1)}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="label-caps text-alarm">empurra para cima</div>
                {[
                  ['Repressão', critico.fatores.repressao, 0.4],
                  ['Fome', critico.fatores.fome, 0.6],
                  ['Guerra prolongada', critico.fatores.guerra, 0.5],
                  ['Desigualdade', critico.fatores.desigualdade, 0.3],
                ].map(([nome, valor, peso]) => (
                  <div key={nome} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-graphite-400">
                        {nome} <span className="text-graphite-600">×{peso}</span>
                      </span>
                      <span className="tabular-nums text-graphite-300">{valor}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-graphite-800">
                      <div className="h-full bg-alarm/70" style={{ width: `${valor}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="label-caps text-calm">puxa para baixo</div>
                {[
                  ['Propaganda (temporária)', critico.propagandaStock, 0.3, 120],
                  ['Entrega real (permanente)', critico.entregaStock, 0.55, 90],
                ].map(([nome, valor, peso, max]) => (
                  <div key={nome} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-graphite-400">
                        {nome} <span className="text-graphite-600">×{peso}</span>
                      </span>
                      <span className="tabular-nums text-graphite-300">{valor}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-graphite-800">
                      <div className="h-full bg-calm/70" style={{ width: `${(valor / max) * 100}%` }} />
                    </div>
                  </div>
                ))}

                <p className="pt-2 text-xs leading-relaxed text-graphite-500">
                  Propaganda decai 40% por turno assim que o gasto para. Entrega real de educação,
                  saúde e infraestrutura acumula e não volta atrás.
                </p>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------- território (expansionista) */}
          {regimeData.params.expansionista && dificuldade.overextension && (
            <section className="panel border-alarm/40 p-5">
              <div className="label-caps mb-3 text-alarm">sobre-extensão territorial</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-graphite-500">território ocupado</div>
                  <div className="font-display text-2xl tabular-nums text-graphite-100">{regime.territorio}</div>
                </div>
                <div>
                  <div className="text-xs text-graphite-500">limite sustentável</div>
                  <div className="font-display text-2xl tabular-nums text-brass-300">
                    {Math.round(regimeData.params.limiteTerritorioSeguro + regime.poderMilitar * 0.55)}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-graphite-400">
                Este sistema expande {regimeData.params.expansaoForcada} de território por turno mesmo sem
                você mandar. Se o ocupado passar do que a capacidade militar sustenta, o colapso é automático.
              </p>
            </section>
          )}

          {/* --------------------------------------------------------- segmentos */}
          {dificuldade.mostrarSegmentos && preview.segmentos && (
            <section className="panel p-5">
              <div className="label-caps mb-4">como os 9 segmentos estão reagindo ao orçamento</div>
              <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
                {[...SEGMENTS]
                  .sort((a, b) => preview.segmentos[b.id] - preview.segmentos[a.id])
                  .map((seg) => (
                    <SegmentBar key={seg.id} segmentoId={seg.id} valor={preview.segmentos[seg.id]} compacto />
                  ))}
              </div>
            </section>
          )}

          {/* ------------------------------------------------------- histórico */}
          {regime.historico.length > 0 && (
            <section>
              <div className="label-caps mb-2">criticidade × tempo</div>
              <CriticalityChart
                historico={regime.historico}
                unidade={regime.dificuldadeId === 'dificil' ? 'anos' : 'turno'}
              />
            </section>
          )}
        </div>
      </div>
    </Screen>
  );
}
