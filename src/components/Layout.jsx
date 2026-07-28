import { Link } from 'react-router-dom';

/** Cabeçalho de tela: passo, título, subtítulo e ação à direita. */
export function ScreenHeader({ passo, titulo, subtitulo, acao }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-graphite-800 pb-4">
      <div>
        {passo && <div className="label-caps mb-1 text-brass-500">{passo}</div>}
        <h1 className="font-display text-2xl text-graphite-100 sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-graphite-400">{subtitulo}</p>}
      </div>
      {acao}
    </header>
  );
}

/** Container padrão das telas. */
export function Screen({ children, largura = 'max-w-6xl' }) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className={`mx-auto ${largura}`}>
        <Link
          to="/"
          className="label-caps mb-6 inline-block text-graphite-500 transition-colors hover:text-brass-400"
        >
          ← Simulador de Presidente
        </Link>
        {children}
      </div>
    </div>
  );
}

/** Trilha de passos do Modo Campanha. */
export function StepTrail({ atual }) {
  const passos = ['Draft', 'Partido', 'Aprovação', 'Debates', 'Resultado'];
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {passos.map((p, i) => {
        const estado = i < atual ? 'feito' : i === atual ? 'atual' : 'futuro';
        return (
          <li key={p} className="flex items-center gap-2">
            <span
              className={[
                'rounded px-2 py-0.5 font-semibold uppercase tracking-wider',
                estado === 'atual' ? 'bg-brass-600 text-graphite-950' : '',
                estado === 'feito' ? 'text-calm' : '',
                estado === 'futuro' ? 'text-graphite-600' : '',
              ].join(' ')}
            >
              {p}
            </span>
            {i < passos.length - 1 && <span className="text-graphite-700">/</span>}
          </li>
        );
      })}
    </ol>
  );
}
