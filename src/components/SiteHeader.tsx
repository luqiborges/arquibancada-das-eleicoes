import Brand from './Brand';

type SiteHeaderProps = {
  activePage: 'grandstands' | 'serious';
};

export default function SiteHeader({ activePage }: SiteHeaderProps) {
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
    </div>
  </header>);
}
