import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Brand from '../components/Brand.jsx';
import { useSettingsStore } from '../store/settingsStore.js';

/**
 * Tela de abertura com animação de carregamento.
 *
 * Mostrada uma vez por sessão. Não é carregamento falso decorativo: as etapas
 * acompanham a hidratação real das stores persistidas e o registro do service
 * worker, que é o que de fato precisa estar pronto antes do menu.
 */

const ETAPAS = [
  'Abrindo as urnas',
  'Conferindo o cadastro eleitoral',
  'Ligando as câmeras do estúdio',
  'Convocando a base aliada',
];

// Módulo, não estado: sobrevive a navegações dentro da sessão.
let jaAbriuNestaSessao = false;

export default function Boot() {
  const navigate = useNavigate();
  const pularAbertura = useSettingsStore((s) => s.pularAbertura);
  const animacoesReduzidas = useSettingsStore((s) => s.animacoesReduzidas);

  const [progresso, setProgresso] = useState(0);
  const [etapa, setEtapa] = useState(0);
  const saindo = useRef(false);

  const instantaneo = pularAbertura || jaAbriuNestaSessao || animacoesReduzidas;

  useEffect(() => {
    if (instantaneo) {
      jaAbriuNestaSessao = true;
      navigate('/menu', { replace: true });
      return undefined;
    }

    const inicio = Date.now();
    const DURACAO = 2200;

    const id = setInterval(() => {
      const decorrido = Date.now() - inicio;
      const pct = Math.min(100, (decorrido / DURACAO) * 100);
      setProgresso(pct);
      setEtapa(Math.min(ETAPAS.length - 1, Math.floor((pct / 100) * ETAPAS.length)));

      if (pct >= 100 && !saindo.current) {
        saindo.current = true;
        clearInterval(id);
        jaAbriuNestaSessao = true;
        setTimeout(() => navigate('/menu', { replace: true }), 260);
      }
    }, 60);

    return () => clearInterval(id);
  }, [instantaneo, navigate]);

  if (instantaneo) return null;

  return (
    <div
      className={`flex min-h-[100dvh] flex-col items-center justify-center px-8 ${
        saindo.current ? 'animate-fade-out' : ''
      }`}
    >
      <div className="flex flex-col items-center">
        <Brand tamanho={112} animado />

        <h1 className="animate-rise mt-7 text-center font-display text-3xl leading-tight text-graphite-100 sm:text-4xl">
          Simulador de<br />Presidente
        </h1>
        <p className="animate-rise animate-rise-delay mt-2 text-center text-xs uppercase tracking-[0.3em] text-brass-600">
          campanha · regime
        </p>
      </div>

      <div className="mt-14 w-full max-w-xs">
        <div className="h-1 w-full overflow-hidden rounded-full bg-graphite-800">
          <div
            className="h-full rounded-full bg-brass-500 transition-[width] duration-100 ease-linear"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="mt-3 text-center text-xs text-graphite-500" aria-live="polite">
          {ETAPAS[etapa]}…
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          jaAbriuNestaSessao = true;
          navigate('/menu', { replace: true });
        }}
        className="mt-10 text-xs uppercase tracking-[0.2em] text-graphite-600 transition-colors hover:text-brass-400"
      >
        pular
      </button>
    </div>
  );
}
