import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './pages/AppShell';
import { HomePage } from './pages/HomePage';
import { InsightsPage } from './pages/InsightsPage';
import {
  ConfirmPage,
  NicknamePage,
  VinPage,
} from './pages/OnboardingFlow';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SplashPage } from './pages/SplashPage';
import { TireDetailPage } from './pages/TireDetailPage';
import { TireLogPage } from './pages/TireLogPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <span className="demo-chip">WEB DEMO</span>
        <div className="phone">
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/nickname" element={<NicknamePage />} />
            <Route path="/onboarding/vin" element={<VinPage />} />
            <Route path="/onboarding/confirm" element={<ConfirmPage />} />
            <Route path="/app/tire/:tireKey" element={<TireDetailPage />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="tire-log" element={<TireLogPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
