import logo from '../assets/brand/logo-arquibancada.png';

export default function Brand({ footer = false }: {
  footer?: boolean;
}) {
  return <a
    href="/"
    className={`brand${footer ? ' footer-brand' : ''}`}
    aria-label="Arquibancada das Eleições, início"
  >
    <img className="brand-logo" src={logo} alt="Arquibancada das Eleições" width={2172} height={724} />
  </a>;
}
