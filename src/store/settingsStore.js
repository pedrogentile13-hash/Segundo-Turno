/**
 * Preferências do jogador, persistidas em localStorage.
 *
 * Separadas da store de partida de propósito: configuração sobrevive a
 * "nova partida", estado de jogo não.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const OPCOES_TIMER = [
  { valor: 15, nome: '15s', descricao: 'Dá tempo de ler as quatro opções com calma.' },
  { valor: 10, nome: '10s', descricao: 'Padrão. Pressão real sem ser injusto.' },
  { valor: 7, nome: '7s', descricao: 'Para quem já conhece o banco de perguntas.' },
];

export const useSettingsStore = create(
  persist(
    (set) => ({
      /** Mostra o rótulo de tom embaixo de cada resposta no debate. */
      mostrarTomDebate: false,

      /** Draft: 'normal' mostra os valores, 'pro' esconde até o fim. */
      visibilidadeDraft: 'normal',

      /** Segundos por pergunta no debate. */
      segundosDebate: 10,

      /** Corta transições e animações (acessibilidade / celular fraco). */
      animacoesReduzidas: false,

      /** Pula a tela de abertura nas próximas aberturas do app. */
      pularAbertura: false,

      definir: (chave, valor) => set({ [chave]: valor }),
      restaurarPadroes: () =>
        set({
          mostrarTomDebate: false,
          visibilidadeDraft: 'normal',
          segundosDebate: 10,
          animacoesReduzidas: false,
          pularAbertura: false,
        }),
    }),
    {
      name: 'simulador-presidente:config',
      version: 1,
    },
  ),
);
