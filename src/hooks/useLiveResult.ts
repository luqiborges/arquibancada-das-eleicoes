import { useCallback, useEffect, useRef, useState } from 'react';

import { POLL_INTERVAL_MS } from '../config/polling';
import { fetchResult } from '../services/tse';
import type { Result } from '../domain/election/types';

export function useLiveResult(enabled: boolean) {
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState('');
  const [checked, setChecked] = useState('');
  const pending = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (!enabled || pending.current)
      return;
    const controller = new AbortController();
    pending.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20000);
    try {
      const data = await fetchResult('BR', controller.signal);
      if (pending.current === controller) {
        setResult(data);
        setError('');
        setChecked(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      }
    }
    catch (cause) {
      if (pending.current === controller && (!controller.signal.aborted || timedOut)) {
        setError(timedOut ? 'A consulta ao TSE demorou demais. O app tentará novamente automaticamente.' : cause instanceof TypeError ? 'Não foi possível conectar ao TSE. O app tentará novamente automaticamente.' : (cause as Error).message);
      }
    }
    finally {
      clearTimeout(timer);
      if (pending.current === controller) {
        pending.current = null;
      }
    }
  }, [enabled]);
  useEffect(() => {
    if (enabled)
      void refresh();
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [enabled, refresh]);
  useEffect(() => {
    if (!enabled)
      return;
    const check = () => {
      if (!document.hidden)
        void refresh();
    };
    const timer = setInterval(check, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled, refresh]);
  return { result, error, checked };
}
