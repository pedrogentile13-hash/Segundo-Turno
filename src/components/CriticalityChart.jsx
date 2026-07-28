/**
 * Gráfico de criticidade × tempo. SVG puro, sem biblioteca externa:
 * o dado é simples demais para justificar uma dependência de charting.
 */
export default function CriticalityChart({ historico = [], altura = 200, unidade = 'turno' }) {
  if (historico.length === 0) {
    return (
      <div className="panel flex h-40 items-center justify-center text-sm text-graphite-500">
        Nenhum turno registrado ainda.
      </div>
    );
  }

  const largura = 640;
  const margem = { top: 16, right: 16, bottom: 28, left: 34 };
  const areaW = largura - margem.left - margem.right;
  const areaH = altura - margem.top - margem.bottom;

  const n = historico.length;
  const x = (i) => margem.left + (n === 1 ? areaW / 2 : (i / (n - 1)) * areaW);
  const y = (v) => margem.top + areaH - (Math.max(0, Math.min(100, v)) / 100) * areaH;

  const linha = (campo) => historico.map((h, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(h[campo])}`).join(' ');
  const areaCriticidade = `${linha('criticidade')} L ${x(n - 1)} ${margem.top + areaH} L ${x(0)} ${margem.top + areaH} Z`;

  const gradeY = [0, 25, 50, 75, 100];
  // Com muitos turnos, rotula só de 5 em 5 para o eixo não virar borrão.
  const passo = n > 14 ? 5 : n > 8 ? 2 : 1;

  return (
    <div className="panel overflow-x-auto p-3">
      <svg viewBox={`0 0 ${largura} ${altura}`} className="h-auto w-full min-w-[420px]" role="img" aria-label="Criticidade ao longo do tempo">
        {gradeY.map((v) => (
          <g key={v}>
            <line
              x1={margem.left}
              x2={largura - margem.right}
              y1={y(v)}
              y2={y(v)}
              stroke={v === 100 ? '#a8543f' : '#2e312d'}
              strokeWidth="1"
              strokeDasharray={v === 100 ? '4 4' : undefined}
            />
            <text x={margem.left - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#71746f">
              {v}
            </text>
          </g>
        ))}

        <path d={areaCriticidade} fill="rgba(168, 84, 63, 0.14)" />
        <path d={linha('criticidade')} fill="none" stroke="#a8543f" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={linha('aprovacao')} fill="none" stroke="#5c8a72" strokeWidth="1.75" strokeDasharray="5 4" />

        {historico.map((h, i) => (
          <circle key={h.turno} cx={x(i)} cy={y(h.criticidade)} r="2.5" fill={h.evento ? '#c9ac5c' : '#a8543f'} />
        ))}

        {historico.map((h, i) =>
          i % passo === 0 || i === n - 1 ? (
            <text key={`l-${h.turno}`} x={x(i)} y={altura - 8} textAnchor="middle" fontSize="10" fill="#71746f">
              {unidade === 'anos' ? h.ano : h.turno}
            </text>
          ) : null,
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 px-1">
        <span className="flex items-center gap-2 text-xs text-graphite-400">
          <span className="h-0.5 w-5 rounded bg-alarm" /> Criticidade
        </span>
        <span className="flex items-center gap-2 text-xs text-graphite-400">
          <span className="h-0.5 w-5 rounded bg-calm" /> Aprovação
        </span>
        <span className="flex items-center gap-2 text-xs text-graphite-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brass-400" /> Turno com evento
        </span>
      </div>
    </div>
  );
}
