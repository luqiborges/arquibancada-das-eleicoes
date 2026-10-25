import { useCallback, useEffect, useRef, useState } from 'react';

import { STATE_POLL_INTERVAL_MS } from '../config/polling';
import { states } from '../data/states';
import type { Result } from '../domain/election/types';
import { fetchResult } from '../services/tse';

export function useStateResults() {
  const [stateResults, setResults] = useState<Record<string, Result>>({});
  const [stateErrors, setErrors] = useState<Record<string, string>>({});
  const [stateChecks, setStateChecks] = useState<Record<string, string>>({});
  const controller = useRef<AbortController | null>(null);
  const refreshing = useRef(false);
  const refreshStates = useCallback(async () => {
    if (refreshing.current)
      return;
    refreshing.current = true;
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 25000);
    const all = states.map(s => s[0]);
    const pending = new Set(all);
    // Small batches avoid bursts against the public source.
    for (let start = 0; start < all.length && !abort.signal.aborted; start += 4) {
      await Promise.all(all.slice(start, start + 4).map(async (code) => {
        try {
          const data = await fetchResult(code, abort.signal);
          if (!abort.signal.aborted) {
            pending.delete(code);
            setResults(previous => ({ ...previous, [code]: data }));
            setStateChecks(previous => ({ ...previous, [code]: new Date().toLocaleTimeString('pt-BR', { hour12: false }) }));
            setErrors(previous => {
              const next = { ...previous };
              delete next[code];
              return next;
            });
          }
        }
        catch (error) {
          if (!abort.signal.aborted) {
            pending.delete(code);
            setErrors(previous => ({
              ...previous,
              [code]: error instanceof TypeError ? 'Não foi possível conectar ao TSE. O app tentará novamente automaticamente.' : (error as Error).message
            }));
          }
        }
      }));
    }
    if (abort.signal.aborted)
      setErrors(previous => ({
        ...previous,
        ...Object.fromEntries([...pending].map(code => [code, 'A consulta demorou além do esperado. O app tentará novamente automaticamente.']))
      }));
    clearTimeout(timeout);
    refreshing.current = false;
  }, []);
  useEffect(() => {
    void refreshStates();
    return () => {
      controller.current?.abort();
    };
  }, [refreshStates]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden)
        void refreshStates();
    }, STATE_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshStates]);
  return { results: stateResults, errors: stateErrors, checked: stateChecks };
}
