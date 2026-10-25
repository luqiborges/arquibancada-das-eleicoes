import { useEffect, useState } from 'react';
import { Box, Clock3, RotateCcw, Trophy } from 'lucide-react';

import SiteFooter from '../../components/SiteFooter/SiteFooter';
import DataSourceBanner from '../../components/DataSourceBanner';
import BrazilFlag from '../../components/BrazilFlag';
import CandidateAvatar from '../../components/CandidateAvatar';
import CelebratingStadium from '../../features/grandstands/components/CelebratingStadium';
import { useLiveResult } from '../../hooks/useLiveResult';
import type { Daylight } from '../../features/grandstands/scene/daylight';
import LastChecked from '../../components/LastChecked';
import { officialWinner } from '../../domain/election/winner';
import type { Candidate } from '../../domain/election/types';
import { FIRST_ROUND, occupancy, SEAT_COUNT, VOTES_PER_SEAT } from '../../features/grandstands/scale';
import { DEFAULT_CAMERA } from '../../features/grandstands/scene/geometry';
import { APURACAO_START_AT, isEntranceOpen } from '../../domain/election/start';

import './GrandstandsPage.css';
import '../../features/grandstands/styles/scene.css';
import '../../features/grandstands/styles/celebration.css';

const fmt = (n: number) => n.toLocaleString('pt-BR');
// 75% of the camera slider range (0.7 to 1.3).
const initialCamera = { ...DEFAULT_CAMERA, zoom: 1.15 };

export default function GrandstandsPage({ lighting }: { lighting: Daylight }) {
  const [camera, setCamera] = useState(initialCamera);
  const [scheduledOpen, setScheduledOpen] = useState(() => isEntranceOpen(Date.now()));
  const { result, error, checked } = useLiveResult(true);
  const gateOpen = scheduledOpen || (result?.counted ?? 0) > 0;
  const entranceMotion = (result?.progress ?? 0) < 100;
  const winner = officialWinner(result?.candidates ?? []);
  const candidates: Candidate[] = FIRST_ROUND.map(reference => result?.candidates.find(candidate => candidate.number === reference.number) ?? { ...reference, votes: 0, vice: '', percent: 0, elected: false });
  useEffect(() => {
    const previous = document.title;
    document.title = 'Arquibancadas • Arquibancada das Eleições';
    return () => {
      document.title = previous;
    };
  }, []);
  useEffect(() => {
    const check = () => setScheduledOpen(isEntranceOpen(Date.now()));
    const remaining = APURACAO_START_AT - Date.now();
    const timer = remaining > 0 ? setTimeout(check, Math.min(remaining + 25, 2147483647)) : undefined;
    document.addEventListener('visibilitychange', check);
    check();
    return () => {
      if (timer)
        clearTimeout(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [scheduledOpen]);
  return <>
    <main className="stadiums-page page3d">
      <div className="stadium-live-row">
        <div className="stadium-live-info" role="status">
          <span className="status">
            <i />
            {!result ? 'Aguardando dados' : result.progress === 100 ? 'Totalização concluída' : result.counted === 0 ? 'Aguardando os primeiros votos' : 'Apuração em andamento'}
          </span>
          <span className="stadium-national"><BrazilFlag />Brasil · {result ? `${result.progress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}% das seções totalizadas` : 'Resultado nacional'}</span>
        </div>
        <LastChecked value={checked} />
      </div>
      {error && <div className="error" role="alert">
        {error}
        {' '}
        {result && 'Exibindo a última consulta recebida; os dados podem estar desatualizados.'}
      </div>}
      {winner && <aside className="victory3d" role="status">
        <Trophy size={24} />
        <div>
          <strong>{candidates.find(c => c.number === winner)?.name}: eleito segundo o TSE</strong>
          <p>A taça chegou ao gramado! A confirmação veio do TSE; a contagem de votos continua sendo atualizada.</p>
        </div>
      </aside>}
      <aside className="stadium-waiting" role="status">
        <Clock3 size={26} aria-hidden="true" />
        <div>
          <strong>Respira, torcida! A votação vai até as 19h.</strong>
          <p>Segundo a Veja, o horário de votação foi prorrogado em todo o Brasil, até as 19h de Brasília. Enquanto isso, seguimos acompanhando os dados disponibilizados pelo TSE.</p>
          <a href="https://veja.abril.com.br/brasil/zanin-prorroga-votacao-em-todo-o-brasil-para-19h/" target="_blank" rel="noopener noreferrer">Leia a notícia na Veja</a>
        </div>
      </aside>
      <div className="stadiums-grid">
        {candidates.map(candidate => {
          const known = !!result?.candidates.some(c => c.number === candidate.number);
          const selected = winner === candidate.number;
          const votes = candidate.votes;
          const count = occupancy(votes);
          const seatProgress = known ? count.filled === SEAT_COUNT ? 100 : count.remainder / VOTES_PER_SEAT * 100 : 0;
          return <article
            key={candidate.number}
            className={`stadium-card stadium-${candidate.number} card3d ${selected ? 'trophy-selected' : ''}`}
          >
            <div className="stadium-candidate">
              <CandidateAvatar candidate={candidate} />
              <div>
                <span>{candidate.party} · {candidate.number}</span>
                <h2>
                  {candidate.name}
                </h2>
              </div>
              <span className="badge3d">
                {selected ? 'ELEITO PELO TSE' : 'DADOS DO TSE'}
              </span>
            </div>
            <div className="stadium-votes">
              <strong>
                {known ? fmt(votes) : '—'}
              </strong>
              <span>votos contabilizados</span>
            </div>
            <CelebratingStadium
              filled={known ? count.filled : 0}
              green={candidate.number === '22'}
              camera={camera}
              onCamera={setCamera}
              celebrate={selected}
              entranceMotion={entranceMotion}
              gateOpen={gateOpen}
              environment
              lighting={lighting}
            />
            <div className="stadium-occupancy">
              <span><i />{known ? fmt(count.filled) : '—'} {known && count.filled === 1 ? 'pessoinha' : 'pessoinhas'} na arquibancada</span>
              <span>{SEAT_COUNT} lugares</span>
            </div>
            <div
              className="stadium-meter"
              role="progressbar"
              aria-label={count.filled === SEAT_COUNT ? 'Capacidade visual preenchida' : 'Votos para a próxima pessoinha'}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={known ? seatProgress : undefined}
              aria-valuetext={!known ? 'Aguardando os dados oficiais do TSE' : count.filled === SEAT_COUNT ? 'Capacidade visual preenchida' : `${fmt(count.remainder)} de ${fmt(VOTES_PER_SEAT)} votos`}
            >
              <div style={{ width: `${seatProgress}%` }} />
            </div>
            <p className="seat-remainder">
              {!known ? 'Aguardando os dados oficiais do TSE.' : count.overflow ? `Casa cheia! Mais ${fmt(count.overflow)} votos além da capacidade visual.` : count.remainder ? `Faltam ${fmt(VOTES_PER_SEAT - count.remainder)} votos para a próxima pessoinha.` : 'Uma pessoinha entra a cada 100 mil votos.'}
            </p>
          </article>;
        })}
      </div>
      <section className="camera3d" aria-label="Controles da câmera">
        <span><Box size={15} /> Arraste qualquer estádio para girar os dois.</span>
        <div>
          <button
            onClick={() => setCamera({ ...camera, yaw: camera.yaw - .35 })}
            aria-label="Girar câmera para a esquerda"
          >↶</button>
          <button
            onClick={() => setCamera({ ...camera, yaw: camera.yaw + .35 })}
            aria-label="Girar câmera para a direita"
          >↷</button>
          <button onClick={() => setCamera({ ...camera, pitch: 1.2 })}>Vista de cima</button>
          <button onClick={() => setCamera(initialCamera)}><RotateCcw size={12} />Restaurar vista</button>
        </div>
        <label>Zoom<input
          type="range"
          aria-label="Zoom dos estádios 3D"
          min={.7}
          max={1.3}
          step={.05}
          value={camera.zoom}
          onChange={e => setCamera({ ...camera, zoom: Number(e.target.value) })}
        /></label>
      </section>
      <DataSourceBanner />
      <SiteFooter />
    </main>
  </>;
}
