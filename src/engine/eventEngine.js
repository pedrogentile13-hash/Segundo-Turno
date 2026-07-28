/**
 * eventEngine — sorteio e aplicação dos eventos de campanha.
 *
 * O evento é dado (events.js); aqui só existe a matemática de como ele bate
 * no candidato. O modulador é o coração da coisa: o mesmo escândalo destrói
 * um candidato de imagem frágil e mal arranha um de casca grossa.
 */

import { CAMPAIGN_EVENTS } from '../data/events.js';
import { SEGMENTS } from '../data/segments.js';
import { weightedPick, pick } from './random.js';
import { round1 } from './approvalEngine.js';

/** Converte o impacto bruto do evento em pontos de aprovação por segmento. */
const ESCALA_EVENTO = 0.6;

/**
 * Fator do modulador.
 *  - mitiga:    atributo alto reduz o estrago (piso 0.15)
 *  - agrava:    atributo baixo aumenta o estrago (piso 0.35, teto 1.9)
 *  - amplifica: atributo alto aumenta o ganho
 */
export function moduladorFator(modulador, attrs) {
  if (!modulador) return 1;
  const valor = attrs?.[modulador.atributo] ?? 50;
  const desvio = (valor - 50) / 49; // -1 .. +1
  const forca = modulador.forca ?? 1;

  switch (modulador.direcao) {
    case 'mitiga':
      return Math.min(1.8, Math.max(0.15, 1 - forca * desvio));
    case 'agrava':
      return Math.min(1.9, Math.max(0.35, 1 - forca * desvio));
    case 'amplifica':
      return Math.min(2, Math.max(0.3, 1 + forca * desvio));
    default:
      return 1;
  }
}

/** O evento pode entrar no sorteio agora? */
export function eventoElegivel(evento, contexto) {
  const { aprovacaoGeral = 50, aliados = [], jaOcorridos = [] } = contexto;

  if (jaOcorridos.includes(evento.id)) return false;
  if (evento.efeitos?.removerAliado && aliados.length === 0) return false;

  const gatilho = evento.gatilho;
  if (!gatilho) return true;
  if (gatilho.tipo === 'aprovacao_abaixo') return aprovacaoGeral < gatilho.limiar;
  if (gatilho.tipo === 'aprovacao_acima') return aprovacaoGeral > gatilho.limiar;
  return true;
}

/** Sorteia um evento elegível (ou null se não houver nenhum). */
export function rollCampaignEvent(rng, contexto = {}) {
  const elegiveis = CAMPAIGN_EVENTS.filter((e) => eventoElegivel(e, contexto));
  if (elegiveis.length === 0) return null;
  return weightedPick(rng, elegiveis, (e) => e.peso);
}

/**
 * Aplica um evento e devolve os deltas.
 *
 * @returns {{
 *   evento: object, fator: number, impactos: object,
 *   rejeicaoDelta: number, redeAliadosDelta: number, aliadoRemovido: object|null,
 *   resumo: string
 * }}
 */
export function applyCampaignEvent(evento, { attrs, aliados = [], rng }) {
  const fator = moduladorFator(evento.modulador, attrs);
  const impactos = {};

  for (const seg of SEGMENTS) {
    const mult = evento.porSegmento?.[seg.id] ?? 1;
    const valor = evento.base * fator * mult * seg.volatilidade * ESCALA_EVENTO;
    if (Math.abs(valor) > 0.05) impactos[seg.id] = round1(valor);
  }

  let aliadoRemovido = null;
  if (evento.efeitos?.removerAliado && aliados.length > 0 && rng) {
    // Quem tem menos fidelidade sai primeiro.
    aliadoRemovido = weightedPick(rng, aliados, (a) => Math.max(0.05, 1 - (a.fidelidade ?? 0.5))) || pick(rng, aliados);
  }

  const rejeicaoDelta = (evento.efeitos?.rejeicaoDelta ?? 0) * Math.min(1.4, fator);
  const redeAliadosDelta = evento.efeitos?.redeAliadosDelta ?? 0;

  return {
    evento,
    fator: round1(fator * 100) / 100,
    impactos,
    rejeicaoDelta: round1(rejeicaoDelta),
    redeAliadosDelta,
    aliadoRemovido,
    resumo: resumoEvento(evento, fator, aliadoRemovido),
  };
}

function resumoEvento(evento, fator, aliadoRemovido) {
  if (aliadoRemovido) {
    return `${aliadoRemovido.sigla} deixou a coligação. O palanque encolheu no pior momento.`;
  }
  if (evento.base > 0) {
    if (fator > 1.25) return 'Seu perfil pegou a onda em cheio: o efeito veio bem acima do normal.';
    if (fator < 0.8) return 'O impulso existiu, mas seu perfil não soube converter isso em voto.';
    return 'Impulso dentro do esperado para o seu perfil.';
  }
  if (fator <= 0.5) return 'Sua blindagem funcionou: o estrago ficou muito abaixo do que poderia ser.';
  if (fator >= 1.3) return 'Bateu em cheio. Seu ponto fraco estava exposto exatamente aqui.';
  return 'Impacto dentro do esperado para o seu perfil.';
}
