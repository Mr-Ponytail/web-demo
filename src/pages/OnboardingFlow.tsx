import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMG } from '../assets';
import { DEMO_STORAGE_KEYS } from '../data/vehicleMock';
import './OnboardingPages.css';

function OnboardingTopBar() {
  const navigate = useNavigate();
  return (
    <div className="ob-top">
      <button type="button" className="ob-back" aria-label="Back" onClick={() => navigate(-1)}>
        <img src={IMG.back} alt="" width={40} height={40} />
      </button>
    </div>
  );
}

export function NicknamePage() {
  const navigate = useNavigate();
  const [name, setName] = useState(
    () => sessionStorage.getItem(DEMO_STORAGE_KEYS.nickname) ?? '',
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    sessionStorage.setItem(DEMO_STORAGE_KEYS.nickname, trimmed);
    navigate('/onboarding/vin');
  };

  return (
    <div className="screen screen--white onboarding-step">
      <OnboardingTopBar />
      <form className="ob-form" onSubmit={onSubmit}>
        <p className="ob-hello">Hello Driver!</p>
        <h1 className="ob-title">What should we call you?</h1>
        <input
          className="input"
          placeholder="ex) Jerry"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={24}
        />
        <div className="ob-footer-abs">
          <button className="btn-primary" type="submit" disabled={!name.trim()}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export function VinPage() {
  const navigate = useNavigate();
  const [vin, setVin] = useState(
    () => sessionStorage.getItem(DEMO_STORAGE_KEYS.vin) ?? '',
  );
  const [tab, setTab] = useState<'scan' | 'manual'>('manual');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = vin.trim().toUpperCase();
    if (trimmed.length !== 17) return;
    sessionStorage.setItem(DEMO_STORAGE_KEYS.vin, trimmed);
    navigate('/onboarding/confirm');
  };

  return (
    <div className="screen screen--white onboarding-step">
      <OnboardingTopBar />
      <div className="vin-tabs">
        <button
          type="button"
          className={tab === 'scan' ? 'vin-tab vin-tab--on' : 'vin-tab'}
          onClick={() => setTab('scan')}
        >
          VIN Scan
        </button>
        <button
          type="button"
          className={tab === 'manual' ? 'vin-tab vin-tab--on' : 'vin-tab'}
          onClick={() => setTab('manual')}
        >
          Manual Entry
        </button>
      </div>

      {tab === 'scan' ? (
        <div className="vin-scan-disabled">
          <p>Camera scan is not available in the web demo.</p>
          <button type="button" className="btn-primary" onClick={() => setTab('manual')}>
            Use Manual Entry
          </button>
        </div>
      ) : (
        <form className="ob-form" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="vin">
            VIN CODE
          </label>
          <input
            id="vin"
            className="input"
            placeholder="Enter your 17-character VIN"
            value={vin}
            onChange={e => setVin(e.target.value.toUpperCase())}
            maxLength={17}
            spellCheck={false}
          />
          <p className="vin-hint">
            You can find it on your dashboard, door frame.
          </p>
          <div className="ob-footer-abs">
            <button
              className="btn-primary"
              type="submit"
              disabled={vin.trim().length !== 17}
            >
              Verify VIN
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function ConfirmPage() {
  const navigate = useNavigate();
  const vin =
    sessionStorage.getItem(DEMO_STORAGE_KEYS.vin) ?? '1HGCM82633A004352';

  return (
    <div className="screen screen--white onboarding-step">
      <OnboardingTopBar />
      <div className="ob-form">
        <h1 className="ob-title ob-title--confirm">
          Confirm your
          <br />
          vehicle information
        </h1>

        <label className="field-label">VIN</label>
        <div className="input input--readonly">{vin}</div>

        <label className="field-label" style={{ marginTop: 16 }}>
          VEHICLE MODEL
        </label>
        <div className="input input--readonly">2022 Hyundai Porter II</div>

        <label className="field-label" style={{ marginTop: 16 }}>
          WHEEL COUNT
        </label>
        <div className="input input--readonly">6</div>

        <div className="ob-footer-abs ob-footer-abs--stack">
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              sessionStorage.setItem(DEMO_STORAGE_KEYS.onboarded, '1');
              navigate('/app/home', { replace: true });
            }}
          >
            Go to Dashboard
          </button>
          <button
            className="btn-outline"
            type="button"
            onClick={() => navigate('/onboarding/vin')}
          >
            Rescan VIN
          </button>
        </div>
      </div>
    </div>
  );
}
