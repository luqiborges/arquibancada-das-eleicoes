import { RefreshCw } from 'lucide-react';

export default function LastChecked({ value }: {
  value: string;
}) {
  return <span className="last-check"><RefreshCw className="last-check-icon spin" size={16} aria-hidden="true" />Atualizado às <time>
    {value || '--:--:--'}
  </time></span>;
}
