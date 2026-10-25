import { ExternalLink, ShieldCheck } from 'lucide-react';

import { resultUrl } from '../services/tse';

export default function DataSourceBanner({ uf = 'BR' }: {
  uf?: string;
}) {
  return <aside className="info-banner">
    <ShieldCheck size={25} />
    <div>
      <strong>O papo é descontraído. Os dados são do TSE.</strong>
      <p>Os números são consultados nos arquivos públicos do Tribunal Superior Eleitoral. Este é um projeto independente.</p>
    </div>
    <a href={resultUrl(uf)} target="_blank" rel="noreferrer">Ver fonte dos dados <ExternalLink size={14} /></a>
  </aside>;
}
