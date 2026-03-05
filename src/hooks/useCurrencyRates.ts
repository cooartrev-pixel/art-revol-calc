import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SYNC_INTERVAL_MS = 4 * 60 * 60 * 1000;
const CACHE_KEY = 'nbu_exchange_rates';
const DEFAULT_USD_RATE = 41.5;
const DEFAULT_EUR_RATE = 45.0;

export interface CurrencyRates {
  usd: number;
  eur: number;
  date: string | null;
  syncing: boolean;
  fetchRates: (silent?: boolean) => Promise<void>;
}

interface CachedRates {
  usd: number;
  eur: number;
  fetchedAt: string;
  date: string;
}

function getCachedRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as CachedRates;
    const age = Date.now() - new Date(data.fetchedAt).getTime();
    if (age > SYNC_INTERVAL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedRates(rates: CachedRates) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
}

// Singleton state to share across components
let globalRates = { usd: DEFAULT_USD_RATE, eur: DEFAULT_EUR_RATE, date: null as string | null };
let listeners: Set<() => void> = new Set();
let initialized = false;

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function useCurrencyRates(): CurrencyRates {
  const [, forceUpdate] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const fetchRates = useCallback(async (silent = false) => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-exchange-rates');
      if (error) throw error;
      if (data?.success && data.rates?.USD) {
        globalRates = {
          usd: data.rates.USD.rate,
          eur: data.rates.EUR?.rate || DEFAULT_EUR_RATE,
          date: data.rates.USD.date,
        };
        setCachedRates({
          usd: globalRates.usd,
          eur: globalRates.eur,
          fetchedAt: new Date().toISOString(),
          date: globalRates.date!,
        });
        notifyListeners();
      }
    } catch (err) {
      console.error('Error fetching NBU rates:', err);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      const cached = getCachedRates();
      if (cached) {
        globalRates = { usd: cached.usd, eur: cached.eur, date: cached.date };
        notifyListeners();
      } else {
        fetchRates(true);
      }
    }

    syncTimerRef.current = setInterval(() => {
      fetchRates(true);
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [fetchRates]);

  return {
    usd: globalRates.usd,
    eur: globalRates.eur,
    date: globalRates.date,
    syncing,
    fetchRates,
  };
}

/** Format amount with USD/EUR equivalents */
export function formatWithCurrency(amount: number, usdRate: number, eurRate: number): {
  uah: string;
  usd: string;
  eur: string;
} {
  const fmt = (n: number) => new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(n));
  return {
    uah: fmt(amount) + ' ₴',
    usd: '$' + fmt(amount / usdRate),
    eur: '€' + fmt(amount / eurRate),
  };
}
