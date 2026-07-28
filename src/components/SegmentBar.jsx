import { SEGMENT_BY_ID } from '../data/segments.js';

function corDaBarra(valor) {
  if (valor >= 65) return 'bg-calm';
  if (valor >= 50) return 'bg-brass-500';
  if (valor >= 35) return 'bg-brass-700';
  return 'bg-alarm';
}

/**
 * Barra de aprovação de um segmento eleitoral.
 *
 * @param {string} segmentoId
 * @param {number} valor      0-100
 * @param {number} delta      variação recente (mostrada ao lado, se houver)
 * @param {boolean} mostrarPeso  exibe o peso populacional do segmento
 */
export default function SegmentBar({ segmentoId, valor, delta = null, mostrarPeso = false, compacto = false }) {
  const seg = SEGMENT_BY_ID[segmentoId];
  if (!seg) return null;

  const largura = Math.max(0, Math.min(100, valor));

  return (
    <div className={compacto ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2 truncate">
          <span className="label-caps text-graphite-500">{seg.curto}</span>
          <span className={`truncate ${compacto ? 'text-xs' : 'text-sm'} text-graphite-200`}>{seg.nome}</span>
          {mostrarPeso && (
            <span className="label-caps text-graphite-600">{Math.round(seg.peso * 100)}% do eleitorado</span>
          )}
        </div>

        <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
          {delta !== null && delta !== 0 && (
            <span className={`text-xs font-semibold ${delta > 0 ? 'text-calm' : 'text-alarm'}`}>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}
            </span>
          )}
          <span className={`${compacto ? 'text-sm' : 'text-base'} font-semibold text-graphite-100`}>
            {valor.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-graphite-800">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${corDaBarra(valor)}`}
          style={{ width: `${largura}%` }}
        />
      </div>
    </div>
  );
}
