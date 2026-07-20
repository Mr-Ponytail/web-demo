import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from '../components/TabBar';
import { VoiceModal } from '../components/voice/VoiceModal';

export function AppShell() {
  const [voiceOpen, setVoiceOpen] = useState(false);

  return (
    <>
      <Outlet />
      {!voiceOpen ? (
        <TabBar onAiPress={() => setVoiceOpen(true)} />
      ) : null}
      <VoiceModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </>
  );
}
