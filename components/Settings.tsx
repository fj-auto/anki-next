// file: components/Settings.tsx
import React from 'react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (newSettings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Settings</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          const form = e.currentTarget;
          onUpdateSettings({
            newCardsPerDay: parseInt((form.newCardsPerDay as HTMLInputElement).value),
            reviewsPerDay: parseInt((form.reviewsPerDay as HTMLInputElement).value),
            easeBonus: parseFloat((form.easeBonus as HTMLInputElement).value),
            intervalModifier: parseFloat((form.intervalModifier as HTMLInputElement).value),
            maxInterval: parseInt((form.maxInterval as HTMLInputElement).value),
          });
        }}
      >
        <label className="block mb-2">
          New cards per day:
          <input
            type="number"
            name="newCardsPerDay"
            defaultValue={settings.newCardsPerDay}
            className="p-2 border rounded ml-2"
          />
        </label>
        <label className="block mb-2">
          Reviews per day:
          <input
            type="number"
            name="reviewsPerDay"
            defaultValue={settings.reviewsPerDay}
            className="p-2 border rounded ml-2"
          />
        </label>
        <label className="block mb-2">
          Ease bonus:
          <input
            type="number"
            step="0.1"
            name="easeBonus"
            defaultValue={settings.easeBonus}
            className="p-2 border rounded ml-2"
          />
        </label>
        <label className="block mb-2">
          Interval modifier:
          <input
            type="number"
            step="0.1"
            name="intervalModifier"
            defaultValue={settings.intervalModifier}
            className="p-2 border rounded ml-2"
          />
        </label>
        <label className="block mb-2">
          Maximum interval (days):
          <input
            type="number"
            name="maxInterval"
            defaultValue={settings.maxInterval}
            className="p-2 border rounded ml-2"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;
