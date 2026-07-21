import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from '../components/TabBar';
import { VoiceModal } from '../components/voice/VoiceModal';
import { useWakeWordListener } from '../hooks/useWakeWordListener';
import './AppShell.css';

export function AppShell() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceStartListening, setVoiceStartListening] = useState(false);

  const openVoicePanel = useCallback(() => {
    setVoiceStartListening(false);
    setVoiceOpen(true);
  }, []);

  const openVoiceFromWakeWord = useCallback(() => {
    setVoiceStartListening(true);
    setVoiceOpen(true);
  }, []);

  const closeVoice = useCallback(() => {
    setVoiceStartListening(false);
    setVoiceOpen(false);
  }, []);

  useWakeWordListener({
    enabled: !voiceOpen,
    onWakeWord: openVoiceFromWakeWord,
  });

  return (
    <div className="app-shell">
      <div className="app-shell__main">
        <Outlet />
      </div>
      {!voiceOpen ? (
        <TabBar onAiPress={openVoicePanel} />
      ) : null}
      <VoiceModal
        visible={voiceOpen}
        startListening={voiceStartListening}
        onClose={closeVoice}
      />
    </div>
  );
}
