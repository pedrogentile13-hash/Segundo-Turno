import { useEffect, useState } from 'react';

/**
 * Captura o evento `beforeinstallprompt` para oferecer "instalar app" dentro
 * do jogo, em vez de depender do menu escondido do navegador.
 *
 * Só Chromium dispara esse evento. No iOS o caminho é manual (Compartilhar →
 * Adicionar à Tela de Início), então `iosManual` sinaliza esse caso para a UI
 * poder explicar o passo a passo.
 */
export function usePwaInstall() {
  const [evento, setEvento] = useState(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    const jaEmModoApp =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setInstalado(jaEmModoApp);

    const aoReceberPrompt = (e) => {
      e.preventDefault();
      setEvento(e);
    };
    const aoInstalar = () => {
      setInstalado(true);
      setEvento(null);
    };

    window.addEventListener('beforeinstallprompt', aoReceberPrompt);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoReceberPrompt);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  const ehIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return {
    podeInstalar: !!evento && !instalado,
    instalado,
    iosManual: ehIos && !instalado,
    instalar: async () => {
      if (!evento) return false;
      evento.prompt();
      const { outcome } = await evento.userChoice;
      setEvento(null);
      return outcome === 'accepted';
    },
  };
}
