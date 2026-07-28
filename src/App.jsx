import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Boot from './pages/Boot.jsx';
import MainMenu from './pages/MainMenu.jsx';
import Settings from './pages/Settings.jsx';
import Tutorial from './pages/Tutorial.jsx';
import CandidateDraft from './pages/CandidateDraft.jsx';
import PartyBuilder from './pages/PartyBuilder.jsx';
import ApprovalPanel from './pages/ApprovalPanel.jsx';
import DebateMinigame from './pages/DebateMinigame.jsx';
import CampaignResult from './pages/CampaignResult.jsx';
import RegimeSelect from './pages/RegimeSelect.jsx';
import RegimeDashboard from './pages/RegimeDashboard.jsx';
import RegimeResult from './pages/RegimeResult.jsx';
import { useSettingsStore } from './store/settingsStore.js';

/** Volta ao topo a cada troca de tela — no celular isso é obrigatório. */
function RolarParaTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const animacoesReduzidas = useSettingsStore((s) => s.animacoesReduzidas);

  // Uma classe na raiz desliga transições e animações no CSS de uma vez só.
  useEffect(() => {
    document.documentElement.classList.toggle('sem-animacao', animacoesReduzidas);
  }, [animacoesReduzidas]);

  return (
    <>
      <RolarParaTopo />
      <Routes>
        <Route path="/" element={<Boot />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/tutorial" element={<Tutorial />} />

        {/* Modo Campanha: draft → partido → aprovação → debates → resultado */}
        <Route path="/campanha/draft" element={<CandidateDraft />} />
        <Route path="/campanha/partido" element={<PartyBuilder />} />
        <Route path="/campanha/aprovacao" element={<ApprovalPanel />} />
        <Route path="/campanha/debates" element={<DebateMinigame />} />
        <Route path="/campanha/resultado" element={<CampaignResult />} />

        {/* Modo Regime: seleção → painel de governo → resultado */}
        <Route path="/regime" element={<RegimeSelect />} />
        <Route path="/regime/painel" element={<RegimeDashboard />} />
        <Route path="/regime/resultado" element={<RegimeResult />} />

        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </>
  );
}
