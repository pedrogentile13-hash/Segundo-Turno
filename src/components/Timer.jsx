import { useEffect, useRef, useState } from 'react';

/**
 * Timer regressivo do debate.
 *
 * Conta de `segundos` até zero e dispara `onExpirar` uma única vez.
 * A prop `chave` reinicia a contagem — troque-a a cada pergunta nova.
 *
 * A contagem é ancorada num DEADLINE (timestamp em ref), não no valor de
 * estado. Isso evita dois problemas: o disparo não depende de um `restante`
 * defasado logo depois da troca de pergunta, e o callback sai de dentro do
 * intervalo — nunca de dentro de um updater de setState, que renderia o aviso
 * de "setState durante o render de outro componente".
 */
export default function Timer({ segundos = 10, chave, onExpirar, pausado = false }) {
  const [restante, setRestante] = useState(segundos);
  const deadline = useRef(Date.now() + segundos * 1000);
  const disparado = useRef(false);
  const callbackRef = useRef(onExpirar);
  callbackRef.current = onExpirar;

  useEffect(() => {
    deadline.current = Date.now() + segundos * 1000;
    disparado.current = false;
    setRestante(segundos);
  }, [chave, segundos]);

  useEffect(() => {
    if (pausado || disparado.current) return undefined;

    const id = setInterval(() => {
      const rest = Math.max(0, (deadline.current - Date.now()) / 1000);
      setRestante(Math.round(rest * 10) / 10);

      if (rest <= 0 && !disparado.current) {
        disparado.current = true;
        clearInterval(id);
        callbackRef.current?.();
      }
    }, 100);

    return () => clearInterval(id);
  }, [chave, pausado]);

  const proporcao = Math.max(0, Math.min(1, restante / segundos));
  const critico = restante <= 3;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="label-caps">tempo de resposta</span>
        <span
          className={`font-display text-xl tabular-nums ${critico ? 'text-alarm animate-alarm' : 'text-brass-300'}`}
        >
          {restante.toFixed(1)}s
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-graphite-800">
        <div
          className={`h-full rounded-full transition-none ${critico ? 'bg-alarm' : 'bg-brass-500'}`}
          style={{ width: `${proporcao * 100}%` }}
        />
      </div>
    </div>
  );
}
