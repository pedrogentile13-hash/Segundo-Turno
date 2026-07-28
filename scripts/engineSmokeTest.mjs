/**
 * Teste manual dos engines, sem UI. Rode com:  npm run test:engine
 *
 * Não é um framework de teste: é um banco de calibragem. Ele imprime os
 * números que importam e falha (exit 1) se alguma invariante quebrar.
 */

import { ARCHETYPES, ARCHETYPE_BY_ID } from '../src/data/archetypes.js';
import { ATTRIBUTE_IDS } from '../src/data/attributes.js';
import { SEGMENTS, TOTAL_SEGMENT_WEIGHT } from '../src/data/segments.js';
import { ALLY_BY_ID } from '../src/data/parties.js';
import { BROADCASTERS, PERGUNTAS_POR_DEBATE } from '../src/data/broadcasters.js';
import { CAMPAIGN_EVENT_BY_ID } from '../src/data/events.js';
import { REGIMES, DIFFICULTY_BY_ID, DEFAULT_BUDGET } from '../src/data/regimes.js';

import {
  computeApproval,
  computeOverall,
  computeDominantProfile,
  analyzeCoalition,
} from '../src/engine/approvalEngine.js';
import { scoreAnswer, runDebate, drawQuestions } from '../src/engine/debateEngine.js';
import { applyCampaignEvent } from '../src/engine/eventEngine.js';
import { computeElectionResult } from '../src/engine/electionEngine.js';
import { createRegimeState, advanceTurn, previewTurn, summarizeRun } from '../src/engine/regimeEngine.js';
import { createDraftOrder } from '../src/engine/draftEngine.js';
import { createRng } from '../src/engine/random.js';

let falhas = 0;

function check(nome, condicao, detalhe = '') {
  const marca = condicao ? '  ok  ' : ' FALHA';
  console.log(`[${marca}] ${nome}${detalhe ? ` — ${detalhe}` : ''}`);
  if (!condicao) falhas += 1;
}

function titulo(t) {
  console.log(`\n${'='.repeat(72)}\n${t}\n${'='.repeat(72)}`);
}

function barra(valor, largura = 28) {
  const preenchido = Math.round((valor / 100) * largura);
  return `${'█'.repeat(preenchido)}${'·'.repeat(largura - preenchido)}`;
}

// ---------------------------------------------------------------------------
titulo('1. Sanidade dos dados');

check('12 arquétipos no banco', ARCHETYPES.length === 12, `${ARCHETYPES.length}`);
check(
  'draft sorteia 8 arquétipos distintos dos 12',
  (() => {
    const ordem = createDraftOrder(4242);
    return ordem.length === 8 && new Set(ordem).size === 8;
  })(),
);
check(
  'seeds diferentes geram drafts diferentes',
  createDraftOrder(1).join() !== createDraftOrder(2).join(),
);
check('9 segmentos', SEGMENTS.length === 9);
check('pesos dos segmentos somam 1.0', Math.abs(TOTAL_SEGMENT_WEIGHT - 1) < 0.001, TOTAL_SEGMENT_WEIGHT.toFixed(3));
check(
  'todo arquétipo tem os 8 atributos entre 0 e 99',
  ARCHETYPES.every((a) => ATTRIBUTE_IDS.every((id) => a.attrs[id] >= 0 && a.attrs[id] <= 99)),
);
check(
  'todo arquétipo tem rejeição > 0',
  ARCHETYPES.every((a) => a.attrs.rejeicao > 0),
);
check(
  'todo arquétipo tem pelo menos 2 atributos >= 80',
  ARCHETYPES.every((a) => ATTRIBUTE_IDS.filter((id) => id !== 'rejeicao' && a.attrs[id] >= 80).length >= 2),
  ARCHETYPES.map((a) => `${a.id}:${ATTRIBUTE_IDS.filter((id) => id !== 'rejeicao' && a.attrs[id] >= 80).length}`).join(' '),
);
check('3 emissoras', BROADCASTERS.length === 3);
check(
  'cada emissora tem banco maior que a rodada, com 4 opções por pergunta',
  BROADCASTERS.every(
    (b) => b.perguntas.length > PERGUNTAS_POR_DEBATE && b.perguntas.every((p) => p.opcoes.length === 4),
  ),
  BROADCASTERS.map((b) => `${b.id}:${b.perguntas.length}`).join(' '),
);
check(
  'todo id de pergunta é único',
  (() => {
    const ids = BROADCASTERS.flatMap((b) => b.perguntas.map((p) => p.id));
    return new Set(ids).size === ids.length;
  })(),
);
check(
  'sorteio devolve o número certo de perguntas, sem repetir',
  BROADCASTERS.every((b) => {
    const draw = drawQuestions(b.id, 99);
    return draw.length === PERGUNTAS_POR_DEBATE && new Set(draw.map((p) => p.id)).size === draw.length;
  }),
);
check(
  'seeds diferentes sorteiam perguntas diferentes',
  drawQuestions('tv_pulso', 1).map((p) => p.id).join() !==
    drawQuestions('tv_pulso', 2).map((p) => p.id).join(),
);
check('5 sistemas de regime', REGIMES.length === 5);

// ---------------------------------------------------------------------------
titulo('2. Aprovação — candidato de exemplo (draft "populista de massa")');

// Draft simulado: pega os pontos fortes de cada arquétipo.
const escolhas = [
  { arquetipo: 'tribuno_das_redes', atributo: 'carisma' },
  { arquetipo: 'tecnica_do_orcamento', atributo: 'gestao' },
  { arquetipo: 'voz_do_sindicato', atributo: 'base_fiel' },
  { arquetipo: 'tecnica_do_orcamento', atributo: 'rejeicao' },
  { arquetipo: 'fiador_do_congresso', atributo: 'rede_aliados' },
  { arquetipo: 'professora_militante', atributo: 'resiliencia_imagem' },
  { arquetipo: 'gestor_de_fundo', atributo: 'discurso_economico' },
  { arquetipo: 'voz_do_sindicato', atributo: 'discurso_social' },
];
const attrs = {};
for (const e of escolhas) attrs[e.atributo] = ARCHETYPE_BY_ID[e.arquetipo].attrs[e.atributo];

console.log('\nAtributos herdados:');
for (const id of ATTRIBUTE_IDS) console.log(`  ${id.padEnd(20)} ${String(attrs[id]).padStart(3)}`);

const overall = computeOverall(attrs);
const perfil = computeDominantProfile(attrs);
console.log(`\nOverall: ${overall}`);
console.log(`Perfil dominante: ${perfil.dominante.nome} (afinidade ${perfil.ranking[0].afinidade}%)`);
check('overall dentro de 0-99', overall >= 0 && overall <= 99, String(overall));

const eixosPartido = { economico: -20, costumes: 10 };
const aliados = [ALLY_BY_ID.mut, ALLY_BY_ID.pcd, ALLY_BY_ID.urp];
const aprov = computeApproval({ attrs, eixosPartido, aliados });

console.log('\nAprovação por segmento:');
for (const seg of SEGMENTS) {
  const v = aprov.porSegmento[seg.id];
  console.log(`  ${seg.curto} ${seg.nome.padEnd(28)} ${barra(v)} ${String(v).padStart(5)}`);
}
console.log(`\n  APROVAÇÃO GERAL PONDERADA: ${aprov.geral}%`);
console.log(`  Coligação: distância máx ${aprov.coligacao.distanciaMax}, racha ${aprov.coligacao.rachaPenalidade} em ${aprov.coligacao.segmentoRachaNome}`);

check('todo segmento entre 0 e 100', SEGMENTS.every((s) => aprov.porSegmento[s.id] >= 0 && aprov.porSegmento[s.id] <= 100));
check('candidato forte fica acima de 40%', aprov.geral > 40, `${aprov.geral}%`);
check('candidato forte não estoura o teto', aprov.geral < 85, `${aprov.geral}%`);

// ---------------------------------------------------------------------------
titulo('3. Aprovação — candidato deliberadamente ruim (piso do engine)');

const attrsRuim = {};
for (const id of ATTRIBUTE_IDS) attrsRuim[id] = 30;
attrsRuim.rejeicao = 90;
const aprovRuim = computeApproval({ attrs: attrsRuim, eixosPartido: { economico: 95, costumes: -95 }, aliados: [] });
console.log(`  Aprovação geral do candidato ruim: ${aprovRuim.geral}%`);
check('candidato ruim fica abaixo de 35%', aprovRuim.geral < 35, `${aprovRuim.geral}%`);

// ---------------------------------------------------------------------------
titulo('4. Racha de coligação');

const coesa = analyzeCoalition({ economico: -60, costumes: 40 }, [ALLY_BY_ID.mut, ALLY_BY_ID.urp, ALLY_BY_ID.psv]);
const rachada = analyzeCoalition({ economico: -60, costumes: 40 }, [ALLY_BY_ID.pln, ALLY_BY_ID.pot, ALLY_BY_ID.psv]);
console.log(`  Coligação coesa   → distância ${coesa.distanciaMax} | racha ${coesa.rachaPenalidade}`);
console.log(`  Coligação rachada → distância ${rachada.distanciaMax} | racha ${rachada.rachaPenalidade} em ${rachada.segmentoRachaNome}`);
check('coligação coesa não racha', coesa.rachaPenalidade === 0);
check('coligação ideologicamente larga racha', rachada.rachaPenalidade > 5, String(rachada.rachaPenalidade));

// ---------------------------------------------------------------------------
titulo('5. Debate — tom certo x gafe viral');

const pulso = BROADCASTERS.find((b) => b.id === 'tv_pulso');
const pergunta = pulso.perguntas[0];
const noTom = pergunta.opcoes.find((o) => o.tom === 'emocional');
const foraDoTom = pergunta.opcoes.find((o) => o.tom === 'tecnico');

const r1 = scoreAnswer('tv_pulso', noTom);
const r2 = scoreAnswer('tv_pulso', foraDoTom);
const soma = (o) => Object.values(o).reduce((a, b) => a + b, 0);
console.log(`  Resposta no tom  (${noTom.tom}):  saldo ${soma(r1.impactos).toFixed(1)} | gafe: ${r1.gafe}`);
console.log(`  Resposta fora do tom (${foraDoTom.tom}): saldo ${soma(r2.impactos).toFixed(1)} | gafe: ${r2.gafe}`);
check('tom certo em emissora popular dá saldo positivo', soma(r1.impactos) > 0);
check('tom errado marca gafe viral', r2.gafe === true);
check('gafe custa mais caro que a resposta certa', soma(r2.impactos) < soma(r1.impactos));

const debate = runDebate(
  drawQuestions('tv_pulso', 7).map((p) => ({
    broadcasterId: 'tv_pulso',
    perguntaId: p.id,
    opcao: p.opcoes.find((o) => o.tom === 'emocional') || p.opcoes[0],
  })),
);
console.log(`  Debate inteiro no tom: saldo ${debate.saldo}, acertos de tom ${debate.acertosDeTom}/${PERGUNTAS_POR_DEBATE}, gafes ${debate.gafes}`);
check('debate inteiro no tom não gera gafe', debate.gafes === 0);

// ---------------------------------------------------------------------------
titulo('6. Eventos de campanha — o modulador faz diferença?');

const escandalo = CAMPAIGN_EVENT_BY_ID.escandalo_corrupcao;
const blindado = { ...attrs, resiliencia_imagem: 95 };
const fragil = { ...attrs, resiliencia_imagem: 15 };
const impactoBlindado = applyCampaignEvent(escandalo, { attrs: blindado, aliados: [], rng: createRng(1) });
const impactoFragil = applyCampaignEvent(escandalo, { attrs: fragil, aliados: [], rng: createRng(1) });
console.log(`  Escândalo em candidato blindado (RES 95): fator ${impactoBlindado.fator}, saldo ${soma(impactoBlindado.impactos).toFixed(1)}`);
console.log(`  Escândalo em candidato frágil  (RES 15): fator ${impactoFragil.fator}, saldo ${soma(impactoFragil.impactos).toFixed(1)}`);
check('resiliência alta reduz o estrago do escândalo', impactoBlindado.fator < impactoFragil.fator);

const crise = CAMPAIGN_EVENT_BY_ID.crise_economica;
const bomGestor = applyCampaignEvent(crise, { attrs: { ...attrs, gestao: 95 }, aliados: [], rng: createRng(2) });
const mauGestor = applyCampaignEvent(crise, { attrs: { ...attrs, gestao: 20 }, aliados: [], rng: createRng(2) });
console.log(`  Crise com gestão 95: fator ${bomGestor.fator} | gestão 20: fator ${mauGestor.fator}`);
check('gestão baixa agrava a crise econômica', mauGestor.fator > bomGestor.fator);

const traicao = CAMPAIGN_EVENT_BY_ID.traicao_de_aliado;
const saida = applyCampaignEvent(traicao, { attrs, aliados, rng: createRng(7) });
console.log(`  Traição: ${saida.resumo}`);
check('traição remove exatamente um aliado', !!saida.aliadoRemovido);

// ---------------------------------------------------------------------------
titulo('7. Apuração da eleição');

const resultado = computeElectionResult({ attrs, eixosPartido, aliados, seed: 42 });
console.log(`  ${resultado.titulo} — ${resultado.percentualFinal}%`);
console.log(`  ${resultado.comparativo}`);
if (resultado.runoff) {
  console.log(`  2º turno contra ${resultado.runoff.adversario.nome}: ${resultado.runoff.meuPercentual}% x ${resultado.runoff.percentualAdversario}%`);
  check('percentuais do 2º turno somam ~100', Math.abs(resultado.runoff.meuPercentual + resultado.runoff.percentualAdversario - 100) < 0.5);
}
check('status reconhecido', [
  'eleito_primeiro_turno',
  'eleito_segundo_turno',
  'derrotado_segundo_turno',
  'derrotado',
].includes(resultado.status), resultado.status);

// Distribuição de status em 200 partidas aleatórias — o jogo não pode ser
// nem passeio nem parede.
const contagem = { eleito_primeiro_turno: 0, eleito_segundo_turno: 0, derrotado_segundo_turno: 0, derrotado: 0 };
for (let i = 0; i < 200; i += 1) {
  const rng = createRng(1000 + i);
  const a = {};
  for (const id of ATTRIBUTE_IDS) a[id] = Math.floor(rng() * 60) + 35;
  const r = computeElectionResult({
    attrs: a,
    eixosPartido: { economico: rng() * 200 - 100, costumes: rng() * 200 - 100 },
    aliados: [ALLY_BY_ID.pcd, ALLY_BY_ID.mbi],
    seed: i,
  });
  contagem[r.status] += 1;
}
console.log('\n  Distribuição em 200 partidas aleatórias:');
for (const [k, v] of Object.entries(contagem)) console.log(`    ${k.padEnd(26)} ${String(v).padStart(3)} (${((v / 200) * 100).toFixed(0)}%)`);
check('existe vitória possível', contagem.eleito_primeiro_turno + contagem.eleito_segundo_turno > 10);
check('existe derrota possível', contagem.derrotado + contagem.derrotado_segundo_turno > 10);

// ---------------------------------------------------------------------------
titulo('8. Modo Regime — uma partida por sistema (dificuldade Difícil)');

for (const regime of REGIMES) {
  let state = createRegimeState({ regimeId: regime.id, dificuldadeId: 'dificil', seed: 2024 });
  const orcamento =
    regime.id === 'hipermilitarizacao'
      ? { educacao: 8, saude: 8, defesa: 46, infraestrutura: 18, propaganda: 20 }
      : { ...DEFAULT_BUDGET };

  while (!state.fim) {
    state = advanceTurn(state, { orcamento, imposto: regime.params.impostoPadrao, acao: 'manter' });
  }
  const resumo = summarizeRun(state);
  console.log(
    `  ${regime.nome.padEnd(34)} durou ${String(resumo.anos).padStart(2)} ${resumo.unidade} → ${resumo.causa.nome}` +
      ` (crit. pico ${resumo.picoCriticidade}, inflação média ${resumo.mediaInflacao}%)`,
  );
  check(`  ${regime.id}: partida termina`, !!state.fim);
  check(`  ${regime.id}: histórico registrado`, state.historico.length === state.turno);
}

// ---------------------------------------------------------------------------
titulo('9. Modo Regime — propaganda é temporária, entrega é permanente');

const base = createRegimeState({ regimeId: 'corporativismo_estatal', dificuldadeId: 'medio', seed: 77 });
let comPropaganda = base;
let comEntrega = base;
const orcPropaganda = { educacao: 8, saude: 8, defesa: 20, infraestrutura: 19, propaganda: 45 };
const orcEntrega = { educacao: 28, saude: 28, defesa: 15, infraestrutura: 24, propaganda: 5 };

for (let t = 0; t < 8 && !comPropaganda.fim; t += 1) {
  comPropaganda = advanceTurn(comPropaganda, { orcamento: orcPropaganda, imposto: 55 });
}
for (let t = 0; t < 8 && !comEntrega.fim; t += 1) {
  comEntrega = advanceTurn(comEntrega, { orcamento: orcEntrega, imposto: 55 });
}
console.log(`  Estratégia propaganda: criticidade final ${comPropaganda.criticidade} | estoque propaganda ${comPropaganda.propagandaStock} | entrega ${comPropaganda.entregaStock}`);
console.log(`  Estratégia entrega:    criticidade final ${comEntrega.criticidade} | estoque propaganda ${comEntrega.propagandaStock} | entrega ${comEntrega.entregaStock}`);
check('entrega real acumula mais estoque permanente', comEntrega.entregaStock > comPropaganda.entregaStock);

// Propaganda desligada: o estoque tem que evaporar. Usa um regime estável para
// que a partida ainda esteja viva (advanceTurn não mexe em partida encerrada).
let desligado = createRegimeState({ regimeId: 'social_democracia', dificuldadeId: 'dificil', seed: 31 });
const orcSemPropaganda = { ...orcPropaganda, propaganda: 0, infraestrutura: orcPropaganda.infraestrutura + 45 };
for (let t = 0; t < 3; t += 1) desligado = advanceTurn(desligado, { orcamento: orcPropaganda, imposto: 65 });
const estoqueAntes = desligado.propagandaStock;
desligado = advanceTurn(desligado, { orcamento: orcSemPropaganda, imposto: 65 });
desligado = advanceTurn(desligado, { orcamento: orcSemPropaganda, imposto: 65 });
console.log(`  Estoque de propaganda: ${estoqueAntes} → ${desligado.propagandaStock} depois de 2 turnos sem gastar`);
check('estoque de propaganda decai quando o gasto para', desligado.propagandaStock < estoqueAntes * 0.5);

// ---------------------------------------------------------------------------
titulo('10. Modo Regime — sobre-extensão territorial');

let expansionista = createRegimeState({ regimeId: 'hipermilitarizacao', dificuldadeId: 'dificil', seed: 5 });
while (!expansionista.fim) {
  expansionista = advanceTurn(expansionista, {
    orcamento: { educacao: 10, saude: 10, defesa: 30, infraestrutura: 30, propaganda: 20 },
    imposto: 60,
    acao: 'expandir',
  });
}
console.log(`  Expansão agressiva → fim em ${expansionista.turno} anos por: ${expansionista.fim.nome}`);
console.log(`  Território final ${expansionista.territorio} | poder militar ${expansionista.poderMilitar}`);
check('expansão sem lastro leva a colapso', expansionista.fim.id === 'colapso_overextension');

// ---------------------------------------------------------------------------
titulo('11. Modo Regime — os 9 segmentos reagem ao sistema, não só ao orçamento');

for (const rid of ['economia_planejada', 'capitalismo_liberal', 'hipermilitarizacao']) {
  const st = createRegimeState({ regimeId: rid, dificuldadeId: 'medio', seed: 5 });
  const p = previewTurn(st); // orçamento exatamente no padrão
  const ord = Object.entries(p.segmentos).sort((a, b) => b[1] - a[1]);
  const amplitude = ord[0][1] - ord[ord.length - 1][1];
  console.log(
    `  ${p.regime.nome.padEnd(34)} melhor ${ord[0][0]} ${ord[0][1]} | pior ${ord[ord.length - 1][0]} ${ord[ord.length - 1][1]} | amplitude ${amplitude.toFixed(1)}`,
  );
  check(`  ${rid}: segmentos não são todos iguais`, amplitude > 5, amplitude.toFixed(1));
}

const planejada = previewTurn(createRegimeState({ regimeId: 'economia_planejada', dificuldadeId: 'medio', seed: 5 }));
const liberal = previewTurn(createRegimeState({ regimeId: 'capitalismo_liberal', dificuldadeId: 'medio', seed: 5 }));
check(
  'esquerda urbana prefere economia planejada a capitalismo liberal',
  planejada.segmentos.esquerda_urbana > liberal.segmentos.esquerda_urbana,
);
check(
  'classe média empresarial prefere capitalismo liberal a economia planejada',
  liberal.segmentos.classe_media_empresarial > planejada.segmentos.classe_media_empresarial,
);

// ---------------------------------------------------------------------------
titulo('12. Modo Regime — preview reage a slider (modo Fácil)');

const facil = createRegimeState({ regimeId: 'social_democracia', dificuldadeId: 'facil', seed: 9 });
const pInfra = previewTurn(facil, { educacao: 25, saude: 25, defesa: 5, infraestrutura: 40, propaganda: 5 }, 65);
const pDefesa = previewTurn(facil, { educacao: 5, saude: 5, defesa: 70, infraestrutura: 10, propaganda: 10 }, 65);
console.log(`  Orçamento social  → criticidade ${pInfra.critico.criticidade} | inflação ${pInfra.economia.inflacao}% | ${pInfra.regime.indicePrincipal.nome} ${pInfra.indice}`);
console.log(`  Orçamento militar → criticidade ${pDefesa.critico.criticidade} | inflação ${pDefesa.economia.inflacao}% | ${pDefesa.regime.indicePrincipal.nome} ${pDefesa.indice}`);
check('gasto social reduz criticidade em relação ao militar', pInfra.critico.criticidade < pDefesa.critico.criticidade);
check('modo fácil expõe só 2 controles', DIFFICULTY_BY_ID.facil.slidersLiberados.length === 2);

// ---------------------------------------------------------------------------
titulo(falhas === 0 ? '✓ TODOS OS CHECKS PASSARAM' : `✗ ${falhas} CHECK(S) FALHARAM`);
process.exit(falhas === 0 ? 0 : 1);
