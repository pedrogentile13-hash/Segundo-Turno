/**
 * Bloco de número grande com rótulo — usado nos painéis de aprovação,
 * de governo e nas telas de resultado.
 */
export default function StatTile({ rotulo, valor, sufixo = '', nota = null, tom = 'neutro', delta = null }) {
  const tons = {
    neutro: 'text-graphite-100',
    bom: 'text-calm',
    atencao: 'text-brass-300',
    ruim: 'text-alarm',
  };

  return (
    <div className="panel px-4 py-3">
      <div className="label-caps">{rotulo}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`font-display text-3xl tabular-nums ${tons[tom] ?? tons.neutro}`}>
          {valor}
          <span className="text-lg">{sufixo}</span>
        </span>
        {delta !== null && delta !== 0 && (
          <span className={`text-xs font-semibold tabular-nums ${delta > 0 ? 'text-alarm' : 'text-calm'}`}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
          </span>
        )}
      </div>
      {nota && <p className="mt-1 text-xs leading-snug text-graphite-500">{nota}</p>}
    </div>
  );
}
