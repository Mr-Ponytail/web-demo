import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from '../components/TabBar';
import { VoiceModal } from '../components/voice/VoiceModal';
import './AppShell.css';

export function AppShell() {
  const [voiceOpen, setVoiceOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="app-shell__main">
        <Outlet />
      </div>
      {!voiceOpen ? (
        <TabBar onAiPress={() => setVoiceOpen(true)} />
      ) : null}
      <VoiceModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}
