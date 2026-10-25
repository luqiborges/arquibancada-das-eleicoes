import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, ChevronDown, CircleHelp, Globe2, MapPin, Radio, Search, Vote } from 'lucide-react';

import SiteFooter from '../../components/SiteFooter/SiteFooter';
import DataSourceBanner from '../../components/DataSourceBanner';
import SiteHeader from '../../components/SiteHeader';
import BrazilFlag from '../../components/BrazilFlag';
import { useStateResults } from '../../hooks/useStateResults';
import { useLiveResult } from '../../hooks/useLiveResult';
import LastChecked from '../../components/LastChecked';
import { states } from '../../data/states';
import type { Candidate, Result } from '../../domain/election/types';
import CandidateAvatar from '../../components/CandidateAvatar';

import './SeriousPage.css';

const number = (n: number) => n.toLocaleString('pt-BR');
const percent = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tone = (c: Candidate) => c.party === 'PT' ? 'coral' : c.party === 'PL' ? 'blue' : Number(c.number) % 2 ? 'coral' : 'blue';

export default function SeriousPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = 'Papo sério • Arquibancada das Eleições';
    return () => {
      document.title = previous;
    };
  }, []);
  const [uf, setUf] = useState('BR');
  const national = useLiveResult(true);
  const { results: stateResults, errors: stateErrors, checked: stateChecks } = useStateResults();
  const results: Record<string, Result | undefined> = { ...stateResults, ...(national.result ? { BR: national.result } : {}) };
  const errors: Record<string, string> = { ...stateErrors, BR: national.error };
  const lastCheck = uf === 'BR' ? national.checked : stateChecks[uf] ?? '';
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('Todas as regiões');
  const [help, setHelp] = useState(false);
  const result = results[uf];
  const location = uf === 'BR' ? 'Brasil' : states.find(s => s[0] === uf)![1];
  const filtered = states.filter(s => (region === 'Todas as regiões' || s[2] === region) && `${s[0]} ${s[1]}`.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  const candidates = result?.candidates ?? [];
  const difference = candidates.length > 1 ? Math.abs(candidates[0].votes - candidates[1].votes) : 0;
  return <>
    <SiteHeader activePage="serious" />
    <main className="overview-page">
      <div className="eyebrow"><BrazilFlag /> ELEIÇÕES GERAIS <span className="separator">/</span> 25 OUTUBRO 2026 <span className="turn">2º TURNO</span></div>
      <div className="toolbar">
        <label className="location-select">
          <MapPin size={17} />
          <select aria-label="Local do resultado" value={uf} onChange={event => setUf(event.target.value)}>
            <option value="BR">Brasil • resultado nacional</option>
            {states.map(s => <option key={s[0]} value={s[0]}>{s[1]} ({s[0]})</option>)}
          </select>
          <ChevronDown size={15} />
        </label>
        <div className="update-controls">
          <LastChecked value={lastCheck} />
        </div>
      </div>
      {errors[uf] && <div className="error" role="alert">
        {errors[uf]}
        {' '}
        {result && 'Exibindo a última consulta recebida; os dados podem estar desatualizados.'}
      </div>}
      <section className="result-panel">
        <div className="panel-heading">
          <div className="office">
            <span className="office-icon">
              <Vote size={20} />
            </span>
            <div>
              <h2>Presidente</h2>
              <span>
                {location}
                {' '}
                <span className="muted">• 2º turno</span>
              </span>
            </div>
          </div>
          <span className="status">
            <i />
            {!result ? 'Aguardando dados' : result.progress === 100 ? 'Totalização concluída' : result.counted === 0 ? 'Aguardando apuração' : 'Apuração em andamento'}
          </span>
        </div>
        <div className="counting">
          <div>
            <span>Seções totalizadas</span>
            <strong>
              {result ? percent(result.progress) : '—'}
              <small>%</small>
            </strong>
          </div>
          <span>
            {result ? `${number(result.counted)} de ${number(result.total)} seções` : 'Aguardando divulgação do TSE'}
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Seções totalizadas"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result?.progress ?? 0}
        >
          <div style={{ width: `${result?.progress ?? 0}%` }} />
        </div>
        <div className="candidate-grid">
          {candidates.length ? candidates.map((candidate, index) => <article key={candidate.number} className={`candidate ${tone(candidate)}`}>
            <div className="candidate-top">
              <span className="party">
                {candidate.party}
                {' '}
                <span>• {candidate.number}</span>
              </span>
              {candidate.elected ? <span className="elected"><Check size={13} /> Eleito pelo TSE</span> : index === 0 && candidate.votes > 0 && difference > 0 ? <span className="leading">Na frente</span> : <span className="candidate-label">Candidato</span>}
            </div>
            <div className="candidate-identity">
              <CandidateAvatar candidate={candidate} />
              <div>
                <h3>
                  {candidate.name.toLocaleLowerCase('pt-BR')}
                </h3>
                <p>Vice: {candidate.vice.toLocaleLowerCase('pt-BR') || 'Não informado'}</p>
              </div>
            </div>
            <div className="candidate-percent">
              {percent(candidate.percent)}
              <span>%</span>
            </div>
            <div className="candidate-bar">
              <div style={{ width: `${candidate.percent}%` }} />
            </div>
            <div className="vote-count"><strong>
              {number(candidate.votes)}
            </strong> votos válidos</div>
          </article>) : <div className="empty-candidates">
            <Radio size={30} />
            <h3>Aguardando os resultados oficiais</h3>
            <p>Os candidatos e os votos aparecerão aqui assim que os dados estiverem disponíveis.</p>
          </div>}
        </div>
        <div className="result-note">
          <span>
            <span className="note-dot" />
            {difference > 0 ? `Diferença de ${number(difference)} votos entre os candidatos` : 'A disputa é decidida pela maioria dos votos válidos'}
          </span>
          <button onClick={() => setHelp(!help)} aria-expanded={help}><CircleHelp size={14} /> Entenda a apuração</button>
        </div>
        {help && <div className="help">O percentual de cada candidato considera os votos válidos, excluindo brancos e nulos. Seções totalizadas são as seções cujos resultados já foram processados. Estar na frente durante a apuração não significa estar eleito: o selo de eleito só aparece quando informado pelo TSE. As consultas automáticas ocorrem a cada 5 segundos para o Brasil e os estados, com a aba visível.</div>}
      </section>
      <section className="stats" aria-label="Resumo da votação">
        {[
          ['Votos válidos', result?.valid, 'Votos destinados aos candidatos'],
          ['Votos em branco', result?.blank, 'Não entram na decisão'],
          ['Votos nulos', result?.nullVotes, 'Não entram na decisão'],
          ['Comparecimento', result?.turnout, 'Eleitores nas seções totalizadas']
        ].map(([label, value, detail]) => <article key={String(label)}>
          <span>
            {label}
          </span>
          <strong>
            {typeof value === 'number' ? number(value) : '—'}
          </strong>
          <small>
            {detail}
          </small>
        </article>)}
      </section>
      <section className="state-section" id="states">
        <div className="section-heading">
          <div>
            <span className="section-kicker">DE NORTE A SUL</span>
            <h2>E aí, como tá por aí?</h2>
            <p>Escolhe um estado e dá uma espiada nos números.</p>
          </div>
          <Globe2 className="globe" size={44} strokeWidth={1} />
        </div>
        <div className="state-filters">
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Buscar estado"
              placeholder="Buscar estado ou UF"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <label className="region">
            <select
              aria-label="Filtrar por região"
              value={region}
              onChange={event => setRegion(event.target.value)}
            >
              {['Todas as regiões', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'].map(r => <option key={r}>
                {r}
              </option>)}
            </select>
            <ChevronDown size={14} />
          </label>
          <span>{filtered.length} estados <ArrowDown size={13} /></span>
        </div>
        <div className="states-grid">
          {filtered.map(([code, name]) => {
            const data = results[code];
            const leader = data?.candidates[0];
            const hasLeader = leader && leader.votes > 0 && leader.votes > (data?.candidates[1]?.votes ?? 0);
            return <button
              key={code}
              className={`state-card ${uf === code ? 'selected' : ''}`}
              onClick={() => {
                setUf(code);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="state-title">
                <span className="uf">
                  {code}
                </span>
                <strong>
                  {name}
                </strong>
                <ArrowUpRight size={15} />
              </div>
              <div className="state-result">
                {errors[code] ? 'Dados indisponíveis' : hasLeader ? <>
                  <span className={`leader-dot ${tone(leader)}`} />
                  <span className="state-leader">
                    {leader.name.toLocaleLowerCase('pt-BR')}
                  </span>
                  <strong>{percent(leader.percent)}%</strong>
                </> : data ? 'Aguardando os primeiros votos' : 'Aguardando dados'}
              </div>
              <div className="state-progress">
                <div style={{ width: `${data?.progress ?? 0}%` }} />
              </div>
              <div className="state-bottom">
                <span>Seções totalizadas</span>
                <strong>
                  {data ? `${percent(data.progress)}%` : '—'}
                </strong>
              </div>
            </button>;
          })}
        </div>
        {filtered.length === 0 && <p className="no-results">Nenhum estado encontrado. Tente outro nome ou região.</p>}
      </section>
      <DataSourceBanner uf={uf} />
      <SiteFooter />
    </main>
  </>;
}
