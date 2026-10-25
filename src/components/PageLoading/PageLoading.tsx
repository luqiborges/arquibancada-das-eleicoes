import './PageLoading.css';

export default function PageLoading({ serious = false }: { serious?: boolean }) {
  return <main className="page-loading" aria-busy="true">
    <p className="page-loading-status" role="status">
      <span aria-hidden="true" />
      {serious ? 'Preparando o placar…' : 'Preparando as arquibancadas…'}
    </p>
    <div className="page-loading-layout" aria-hidden="true">
      {[0, 1].map(item => <div className="page-loading-card" key={item}>
        <div className="page-loading-line" />
        <div className="page-loading-line page-loading-line-short" />
        <div className="page-loading-panel" />
      </div>)}
    </div>
  </main>;
}
