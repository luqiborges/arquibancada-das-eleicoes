import { lazy, Suspense, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import SiteHeader from '../components/SiteHeader';
import PageLoading from '../components/PageLoading/PageLoading';
import { paletteVariables } from '../theme/palettes';
import { useLocalDaylight } from '../hooks/useLocalDaylight';
import { useThemePreference } from '../hooks/useThemePreference';
import { resolveRoute } from './routes';

const GrandstandsPage = lazy(() => import('../pages/GrandstandsPage/GrandstandsPage'));
const SeriousPage = lazy(() => import('../pages/SeriousPage/SeriousPage'));

export default function App() {
  const [route, setRoute] = useState(() => resolveRoute());
  const [themePreference, setThemePreference] = useThemePreference();
  const { palette, scheme, lighting } = useLocalDaylight(themePreference);
  useEffect(() => {
    const root = document.documentElement;
    const previousBackground = root.style.backgroundColor;
    const previousScheme = root.style.colorScheme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const previousThemeColor = themeColor?.getAttribute('content');
    root.style.backgroundColor = palette.background;
    root.style.colorScheme = scheme;
    themeColor?.setAttribute('content', palette.background);
    return () => {
      root.style.backgroundColor = previousBackground;
      root.style.colorScheme = previousScheme;
      if (previousThemeColor !== null && previousThemeColor !== undefined) themeColor?.setAttribute('content', previousThemeColor);
    };
  }, [palette.background, scheme]);
  useEffect(() => {
    const onPopState = () => setRoute(resolveRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest('.header a');
    if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || !['/', '/papo-serio'].includes(url.pathname)) return;
    event.preventDefault();
    if (url.href === window.location.href) return;
    window.history.pushState(null, '', url);
    setRoute(resolveRoute());
    window.scrollTo(0, 0);
  };
  const serious = route === '/papo-serio';

  return (
    <div className="site-theme" data-scheme={scheme} style={{ ...paletteVariables(palette), colorScheme: scheme }}>
      <div onClick={navigate}>
        <SiteHeader activePage={serious ? 'serious' : 'grandstands'} themePreference={themePreference} onThemePreferenceChange={setThemePreference} />
        <Suspense fallback={<PageLoading serious={serious} />}>
          {serious ? <SeriousPage /> : <GrandstandsPage lighting={lighting} />}
        </Suspense>
      </div>
    </div>
  );
}
