import { lazy, Suspense, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowLeft, Palette } from 'lucide-react';

import { colorPalettes, paletteVariables, PaletteContext } from '../../theme/palettes';

import './ColorPreviewPage.css';

const Stands = lazy(() => import('../GrandstandsPage/GrandstandsPage'));
const Serious = lazy(() => import('../SeriousPage/SeriousPage'));

export default function ColorPreviewPage() {
  const initial = new URLSearchParams(window.location.search);
  const [paletteId, setPaletteId] = useState(initial.get('paleta') ?? 'noite');
  const [view, setView] = useState(initial.get('pagina') === 'papo-serio' ? 'papo-serio' : 'arquibancadas');
  const palette = colorPalettes.find(item => item.id === paletteId) ?? colorPalettes[0];
  const update = (id: string, page: string) => {
    setPaletteId(id);
    setView(page);
    const url = new URL(window.location.href);
    url.searchParams.set('paleta', id);
    url.searchParams.set('pagina', page);
    window.history.replaceState(null, '', url);
  };
  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    const anchor = (event.target as Element).closest('a');
    if (!anchor)
      return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || url.hash)
      return;
    if (url.pathname === '/' || url.pathname === '/papo-serio') {
      event.preventDefault();
      update(palette.id, url.pathname === '/' ? 'arquibancadas' : 'papo-serio');
    }
  };
  return <PaletteContext value={palette}>
    <div className="theme-preview" data-palette={palette.id} style={paletteVariables(palette)}>
      <aside className="palette-lab" aria-label="Testar paletas de cores">
        <div className="palette-lab-heading">
          <div>
            <strong><Palette size={18} />Laboratório de cores</strong>
            <p>Teste as três versões. O visual oficial continua igual.</p>
          </div>
          <a href="/" className="palette-exit"><ArrowLeft size={14} />Sair da prévia</a>
        </div>
        <div className="palette-options" role="group" aria-label="Paleta de cores">
          {colorPalettes.map(option => <button
            key={option.id}
            aria-pressed={palette.id === option.id}
            onClick={() => update(option.id, view)}
          >
            <span className="palette-swatches" aria-hidden="true">
              {[option.background, option.text, option.accent].map(color => <i key={color} style={{ background: color }} />)}
            </span>
            <span>
              <strong>
                {option.name}
              </strong>
              <small>
                {option.description}
              </small>
            </span>
          </button>)}
        </div>
        <div className="palette-lab-bottom">
          <div className="palette-views" role="group" aria-label="Página da prévia">
            <button aria-pressed={view === 'arquibancadas'} onClick={() => update(palette.id, 'arquibancadas')}>Arquibancadas</button>
            <button aria-pressed={view === 'papo-serio'} onClick={() => update(palette.id, 'papo-serio')}>Papo sério</button>
          </div>
          <span className="palette-values">Fundo <code>
            {palette.background}
          </code> · Texto <code>
              {palette.text}
            </code> · Destaque <code>
              {palette.accent}
            </code></span>
        </div>
      </aside>
      <div className="theme-preview-stage" onClick={navigate}>
        <Suspense fallback={<main>Preparando a prévia…</main>}>
          {view === 'arquibancadas' ? <Stands /> : <Serious />}
        </Suspense>
      </div>
    </div>
  </PaletteContext>;
}
