/**
 * Slider genérico com rótulo, valor e nota de apoio.
 * Usado tanto nos eixos ideológicos do partido quanto no orçamento do regime.
 */
export default function Slider({
  label,
  valor,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  sufixo = '%',
  nota = null,
  esquerda = null,
  direita = null,
  desabilitado = false,
  acento = 'text-brass-300',
}) {
  return (
    <div className={`space-y-2 ${desabilitado ? 'opacity-40' : ''}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-graphite-200">{label}</span>
        <span className={`font-display text-lg tabular-nums ${acento}`}>
          {typeof valor === 'number' ? Math.round(valor * 10) / 10 : valor}
          {sufixo}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valor}
        disabled={desabilitado}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />

      {(esquerda || direita) && (
        <div className="flex justify-between">
          <span className="label-caps text-graphite-600">{esquerda}</span>
          <span className="label-caps text-graphite-600">{direita}</span>
        </div>
      )}

      {nota && <p className="text-xs leading-snug text-graphite-500">{nota}</p>}
    </div>
  );
}
