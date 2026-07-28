import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home.jsx';
import CandidateDraft from './pages/CandidateDraft.jsx';
import PartyBuilder from './pages/PartyBuilder.jsx';
import ApprovalPanel from './pages/ApprovalPanel.jsx';
import DebateMinigame from './pages/DebateMinigame.jsx';
import CampaignResult from './pages/CampaignResult.jsx';
import RegimeSelect from './pages/RegimeSelect.jsx';
import RegimeDashboard from './pages/RegimeDashboard.jsx';
import RegimeResult from './pages/RegimeResult.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
