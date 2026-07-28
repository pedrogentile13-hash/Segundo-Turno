import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Brand from '../components/Brand.jsx';
import { useGameStore, temCampanhaEmAndamento } from '../store/gameStore.js';
import { useSettingsStore } from '../store/settingsStore.js';
import { usePwaInstall } from '../hooks/usePwaInstall.js';

function BotaoMenu({ children, onClick, variante = 'ghost', nota = null }) {
  const base =
    'w-full rounded-lg px-5 py-4 text-left font-semibold transition-colors active:scale-[0.99] touch-manipulation';
  const estilos = {
    primary: 'bg-brass-600 text-graphite-950 hover:bg-brass-500',
    ghost: 'border border-graphite-700 text-graphite-200 hover:border-brass-600/70 hover:text-brass-300',
    calm: 'border border-calm/50 text-calm hover:bg-calm/10',
  };
  return (
    <button type="button" onClick={onClick} className={`${base} ${estilos[variante]}`}>
      <span className="block">{children}</span>
      {nota && <span className="mt-0.5 block text-xs font-normal opacity-70">{nota}</span>}
    </button>
  );
}

/** Cartão de um modo de jogo, exibido depois de tocar em "Iniciar partida". */
function CartaoModo({ etiqueta, titulo, descricao, itens, cta, onClick, acento }) {
  return (
    <article className="panel flex flex-col p-5">
      <span className={`label-caps ${acento}`}>{etiqueta}</span>
      <h2 className="mt-1.5 font-display text-xl text-graphite-100 sm:text-2xl">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-graphite-400">{descricao}</p>

      <ul className="mt-3 flex-1 space-y-1">
        {itens.map((item) => (
          <li key={item} className="flex gap-2 text-xs text-graphite-400">
            <span className="text-brass-600">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onClick} className="btn-primary mt-5 w-full py-3">
        {cta}
      </button>
    </article>
  );
}

export default function MainMenu() {
  const navigate = useNavigate();

  const campanha = useGameStore((s) => s.campanha);
  const regime = useGameStore((s) => s.regime);
  const iniciarCampanha = useGameStore((s) => s.iniciarCampanha);
  const reiniciarRegime = useGameStore((s) => s.reiniciarRegime);
  const visibilidadeDraft = useSettingsStore((s) => s.visibilidadeDraft);

  const { podeInstalar, instalado, iosManual, instalar } = usePwaInstall();

  const [mostrarModos, setMostrarModos] = useState(false);
  const [dicaIos, setDicaIos] = useState(false);

  const campanhaEmAndamento = temCampanhaEmAndamento(campanha);
  const regimeEmAndamento = regime && !regime.fim;

  const continuar = () => {
    if (regimeEmAndamento) return navigate('/regime/painel');
    if (!campanha.draftCompleto) return navigate('/campanha/draft');
    if (!campanha.partidoDefinido) return navigate('/campanha/partido');
    return navigate('/campanha/debates');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        {/* ------------------------------------------------------- cabeçalho */}
        <header className="flex flex-col items-center pt-6 text-center">
          <Brand tamanho={72} />
          <h1 className="mt-4 font-display text-3xl leading-tight text-graphite-100 sm:text-4xl">
            Simulador de Presidente
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-graphite-400">
            Monte um candidato juntando pedaços de doze arquétipos e sobreviva à campanha. Ou pule a
            eleição e assuma um regime inteiro, para descobrir em quantos anos ele cai.
          </p>
        </header>

        {/* ----------------------------------------------------------- menu */}
        <nav className="mt-9 space-y-3">
          {(campanhaEmAndamento || regimeEmAndamento) && (
            <BotaoMenu
              variante="calm"
              onClick={continuar}
              nota={
                regimeEmAndamento
                  ? `Modo Regime · turno ${regime.turno + 1}`
                  : `Modo Campanha · ${campanha.escolhas.length}/8 atributos herdados`
              }
            >
              Continuar partida
            </BotaoMenu>
          )}

          <BotaoMenu variante="primary" onClick={() => setMostrarModos((v) => !v)}>
            {mostrarModos ? 'Iniciar partida ▴' : 'Iniciar partida ▾'}
          </BotaoMenu>

          {mostrarModos && (
            <div className="grid gap-3 pt-1 sm:grid-cols-2">
              <CartaoModo
                etiqueta="modo 1"
                acento="text-brass-500"
                titulo="Campanha Eleitoral"
                descricao="Do draft do candidato até a apuração, passando pelo palanque e pelo estúdio."
                itens={[
                  'Draft de 8 rodadas entre 12 arquétipos',
                  'Partido em 2 eixos e coligação',
                  '3 debates com timer e gafe viral',
                  'Eventos entre os debates',
                ]}
                cta="Começar campanha"
                onClick={() => {
                  iniciarCampanha(visibilidadeDraft);
                  navigate('/campanha/draft');
                }}
              />
              <CartaoModo
                etiqueta="modo 2"
                acento="text-calm"
                titulo="Regime Histórico"
                descricao="Cinco sistemas, orçamento fechado em 100% e uma população que perde a paciência."
                itens={[
                  '5 sistemas econômico-políticos',
                  'Criticidade e inflação em tempo real',
                  'Eventos históricos em cadeia',
                  '3 dificuldades com estruturas distintas',
                ]}
                cta="Escolher sistema"
                onClick={() => {
                  reiniciarRegime();
                  navigate('/regime');
                }}
              />
            </div>
          )}

          <BotaoMenu onClick={() => navigate('/tutorial')} nota="Como funciona cada mecânica">
            Tutorial
          </BotaoMenu>

          <BotaoMenu onClick={() => navigate('/configuracoes')} nota="Dificuldade, timer e dados salvos">
            Configurações
          </BotaoMenu>

          {podeInstalar && (
            <BotaoMenu onClick={instalar} nota="Joga offline, direto da tela de início">
              Instalar aplicativo
            </BotaoMenu>
          )}

          {!podeInstalar && iosManual && (
            <>
              <BotaoMenu onClick={() => setDicaIos((v) => !v)} nota="Joga offline, direto da tela de início">
                Instalar aplicativo
              </BotaoMenu>
              {dicaIos && (
                <div className="panel p-4 text-sm leading-relaxed text-graphite-300">
                  No iPhone o navegador não deixa o site instalar sozinho. Toque no botão{' '}
                  <strong className="text-brass-300">Compartilhar</strong> na barra do Safari e escolha{' '}
                  <strong className="text-brass-300">Adicionar à Tela de Início</strong>.
                </div>
              )}
            </>
          )}
        </nav>

        {/* --------------------------------------------------------- rodapé */}
        <footer className="mt-auto pt-10">
          {instalado && (
            <p className="mb-3 text-center text-xs text-calm">Rodando como aplicativo instalado.</p>
          )}
          <p className="text-center text-[0.7rem] leading-relaxed text-graphite-600">
            Obra de ficção. Arquétipos, partidos, emissoras, apresentadores e segmentos eleitorais são
            inventados e não representam pessoas, legendas, veículos ou instituições reais.
          </p>
        </footer>
      </div>
    </div>
  );
}
