/**
 * Marca do jogo: o mesmo escudo do ícone do app, em SVG.
 *
 * `animado` desenha o traço progressivamente — usado só na tela de abertura.
 */
export default function Brand({ tamanho = 96, animado = false, className = '' }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Brasão do Simulador de Presidente"
    >
      <defs>
        <linearGradient id="brand-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d9ac" />
          <stop offset="100%" stopColor="#b3933f" />
        </linearGradient>
      </defs>

      <path
        d="M50 5 L92 19 L92 44 C92 68 74 86 50 95 C26 86 8 68 8 44 L8 19 Z"
        fill="#101610"
        stroke="url(#brand-brass)"
        strokeWidth="5"
        strokeLinejoin="round"
        pathLength="100"
        className={animado ? 'brand-draw' : undefined}
      />
      {/* Faixa horizontal (fess heráldica). Deliberadamente sem cruz, estrela
          ou qualquer marca que puxe leitura religiosa ou partidária. */}
      <path
        d="M13 40 L87 40 M17 55 L83 55"
        stroke="url(#brand-brass)"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength="100"
        className={animado ? 'brand-draw brand-draw-delay' : undefined}
      />
    </svg>
  );
}
