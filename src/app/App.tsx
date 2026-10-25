import { lazy, Suspense, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import SiteHeader from '../components/SiteHeader';
import PageLoading from '../components/PageLoading/PageLoading';
import { officialPalette, paletteVariables, PaletteContext } from '../theme/palettes';
import { resolveRoute } from './routes';

const GrandstandsPage = lazy(() => import('../pages/GrandstandsPage/GrandstandsPage'));
const SeriousPage = lazy(() => import('../pages/SeriousPage/SeriousPage'));
const ColorPreviewPage = lazy(() => import('../pages/ColorPreviewPage/ColorPreviewPage'));

export default function App() {
  const [route, setRoute] = useState(() => resolveRoute());
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
  const Page = serious ? SeriousPage : GrandstandsPage;

  return (
    <PaletteContext value={officialPalette}>
      <div className="site-theme" style={paletteVariables(officialPalette)}>
        {route === '/cores' ? (
          <Suspense fallback={<PageLoading />}>
            <ColorPreviewPage />
          </Suspense>
        ) : (
          <div onClick={navigate}>
            <SiteHeader activePage={serious ? 'serious' : 'grandstands'} />
            <Suspense fallback={<PageLoading serious={serious} />}>
              <Page showHeader={false} />
            </Suspense>
          </div>
        )}
      </div>
    </PaletteContext>
  );
}
