import Brand from './Brand';
import ThemeSwitch from './ThemeSwitch/ThemeSwitch';
import type { ThemePreference } from '../theme/preference';

type SiteHeaderProps = {
  activePage: 'grandstands' | 'serious';
  themePreference: ThemePreference;
  onThemePreferenceChange: (value: ThemePreference) => void;
};

export default function SiteHeader({ activePage, themePreference, onThemePreferenceChange }: SiteHeaderProps) {
  return (<header className="header">
    <div className="header-inner">
      <Brand />
      <nav aria-label="Navegação principal">
        <a
          href="/"
          className={activePage === 'grandstands' ? 'nav active' : 'nav'}
          aria-current={activePage === 'grandstands' ? 'page' : undefined}
        >Arquibancadas</a>
        <a
          href="/papo-serio"
          className={activePage === 'serious' ? 'nav active' : 'nav'}
          aria-current={activePage === 'serious' ? 'page' : undefined}
        >Papo sério</a>
      </nav>
      <ThemeSwitch value={themePreference} onChange={onThemePreferenceChange} />
    </div>
  </header>);
}
