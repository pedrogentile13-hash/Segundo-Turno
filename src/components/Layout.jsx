import { Link } from 'react-router-dom';

/** Cabeçalho de tela: passo, título, subtítulo e ação à direita. */
export function ScreenHeader({ passo, titulo, subtitulo, acao }) {
  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-graphite-800 pb-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {passo && <div className="label-caps mb-1 text-brass-500">{passo}</div>}
        <h1 className="font-display text-xl text-graphite-100 sm:text-2xl lg:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-graphite-400">{subtitulo}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </header>
  );
}

/**
 * Container padrão das telas.
 *
 * O padding vertical respeita as safe areas do iOS: instalado como app, a
 * barra de status e a barra de gestos ficam por cima do conteúdo sem isso.
 */
export function Screen({ children, largura = 'max-w-6xl' }) {
  return (
    <div className="min-h-[100dvh] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
      <div className={`mx-auto ${largura}`}>
        <Link
          to="/menu"
          className="label-caps mb-5 inline-flex min-h-[2.75rem] items-center text-graphite-500 transition-colors hover:text-brass-400"
        >
          ← Menu
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
