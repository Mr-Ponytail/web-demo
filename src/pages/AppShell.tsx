import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../components/TabBar';
import { VoiceModal } from '../components/voice/VoiceModal';
import { useWakeWordListener } from '../hooks/useWakeWordListener';
import './AppShell.css';

const HOME_PATH = '/app/home';

export function AppShell() {
  const location = useLocation();
  const isHomeScreen =
    location.pathname === HOME_PATH ||
    location.pathname === `${HOME_PATH}/`;
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceStartListening, setVoiceStartListening] = useState(false);
  const [voiceInitialTranscript, setVoiceInitialTranscript] = useState<
    string | null
  >(null);
  const [voiceSessionKey, setVoiceSessionKey] = useState(0);

  const openVoicePanel = useCallback(() => {
    setVoiceInitialTranscript(null);
    setVoiceStartListening(false);
    setVoiceSessionKey(k => k + 1);
    setVoiceOpen(true);
  }, []);

  const openVoiceFromWakeWord = useCallback((command: string | null) => {
    setVoiceInitialTranscript(command);
    setVoiceStartListening(!command);
    setVoiceSessionKey(k => k + 1);
    setVoiceOpen(true);
  }, []);

  const closeVoice = useCallback(() => {
    setVoiceInitialTranscript(null);
    setVoiceStartListening(false);
    setVoiceOpen(false);
  }, []);

  useWakeWordListener({
    enabled: isHomeScreen && !voiceOpen,
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
        key={voiceSessionKey}
        visible={voiceOpen}
        initialTranscript={voiceInitialTranscript}
        startListening={voiceStartListening}
        onClose={closeVoice}
      />
    </div>
  );
}
