import { Moon, Sun, SunMoon } from 'lucide-react';
import type { ThemePreference } from '../../theme/preference';
import './ThemeSwitch.css';

export default function ThemeSwitch({ value, onChange }: { value: ThemePreference; onChange: (value: ThemePreference) => void }) {
  const Icon = value === 'light' ? Sun : value === 'dark' ? Moon : SunMoon;
  const options = [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']] as const;
  return <div className="theme-control"><fieldset className="theme-switch">
    <legend>Aparência do site</legend>
    {options.map(([mode, label]) => <label key={mode}>
      <input type="radio" name="site-appearance" value={mode} checked={value === mode} onChange={() => onChange(mode)} />
      <span>{label}</span>
    </label>)}
  </fieldset>
    <label className="theme-mobile" title={`Aparência: ${options.find(([mode]) => mode === value)![1]}`}>
      <Icon size={19} aria-hidden="true" />
      <select aria-label="Aparência do site" value={value} onChange={event => onChange(event.target.value as ThemePreference)}>
        {options.map(([mode, label]) => <option key={mode} value={mode}>{label}</option>)}
      </select>
    </label>
  </div>;
}
