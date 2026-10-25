import { ArrowUpRight } from 'lucide-react';

import Brand from '../Brand';

import './SiteFooter.css';

export default function SiteFooter() {
  return <footer className="site-footer">
    <a
      className="site-footer-credit"
      href="https://github.com/luqiborges"
      target="_blank"
      rel="noreferrer"
    >Feito por <strong>Lucas Borges</strong><ArrowUpRight size={13} aria-hidden="true" /></a>
    <Brand footer />
    <span className="site-footer-update">Atualização automática a cada 5s</span>
  </footer>;
}
