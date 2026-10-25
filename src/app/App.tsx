import { lazy, Suspense } from 'react';

import { officialPalette, paletteVariables, PaletteContext } from '../theme/palettes';
import { resolveRoute } from './routes';

const GrandstandsPage = lazy(() => import('../pages/GrandstandsPage/GrandstandsPage'));
const SeriousPage = lazy(() => import('../pages/SeriousPage/SeriousPage'));
const ColorPreviewPage = lazy(() => import('../pages/ColorPreviewPage/ColorPreviewPage'));
const route = resolveRoute();

export default function App() {
  const Page = route === '/cores'
    ? ColorPreviewPage
    : route === '/papo-serio' ? SeriousPage : GrandstandsPage;
  const loadingMessage = route === '/papo-serio'
    ? 'Preparando o placar…'
    : 'Preparando as arquibancadas…';

  return (
    <PaletteContext value={officialPalette}>
      <div className="site-theme" style={paletteVariables(officialPalette)}>
        <Suspense fallback={<main>{loadingMessage}</main>}>
          <Page />
        </Suspense>
      </div>
    </PaletteContext>
  );
}
