import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManageTireAxleView } from '../components/tire/ManageTireAxleView';
import { SettingsSubNavBar } from '../components/settings/SettingsSubNavBar';
import type { TireSlotKey } from '../data/tireSlotGrid';
import { registeredTireStore } from '../state/registeredTireStore';
import './ManageTireInformationPage.css';

export function ManageTireInformationPage() {
  const navigate = useNavigate();
  const tireCodes = useSyncExternalStore(
    registeredTireStore.subscribe,
    registeredTireStore.getCodes,
  );

  const handleAdd = (tireKey: TireSlotKey) => {
    const code = tireCodes[tireKey];
    const query = code ? `?code=${encodeURIComponent(code)}` : '';
    navigate(`/app/manage-tire/dot/${tireKey}${query}`);
  };

  return (
    <div className="manage-tire-page">
      <SettingsSubNavBar
        title="Manage Tire Information"
        onBack={() => navigate(-1)}
        showDivider={false}
      />

      <div className="manage-tire-page__scroll">
        <ManageTireAxleView tireCodes={tireCodes} onAdd={handleAdd} />

        <div className="manage-tire-page__footer">
          <p className="manage-tire-page__helper">
            Add at least one tire to continue.
            <br />
            Any unregistered tires can be added later.
          </p>
          <button
            type="button"
            className="manage-tire-page__continue"
            onClick={() => navigate(-1)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
