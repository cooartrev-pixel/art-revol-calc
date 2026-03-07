import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SYNC_INTERVAL_MS = 4 * 60 * 60 * 1000;
const CACHE_KEY = 'nbu_exchange_rates';
const SETTINGS_KEY = 'currency_rate_source';
const DEFAULT_USD_RATE = 41.5;
const DEFAULT_EUR_RATE = 45.0;

export type RateSource = 'nbu' | 'universalbank';

export interface CurrencyRates {
  usd: number;
  eur: number;
  date: string | null;
  syncing: boolean;
  fetchRates: (silent?: boolean) => Promise<void>;
  rateSource: RateSource;
  setRateSource: (source: RateSource) => void;
  nbuUsd: number;
  nbuEur: number;
  universalbankUsd: number | null;
  universalbankEur: number | null;
}

interface CachedRates {
  usd: number;
  eur: number;
  fetchedAt: string;
  date: string;
  nbuUsd: number;
  nbuEur: number;
  universalbankUsd: number | null;
  universalbankEur: number | null;
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

function getSavedSource(): RateSource {
  return (localStorage.getItem(SETTINGS_KEY) as RateSource) || 'nbu';
}

// Singleton state
let globalState = {
  nbuUsd: DEFAULT_USD_RATE,
  nbuEur: DEFAULT_EUR_RATE,
  universalbankUsd: null as number | null,
  universalbankEur: null as number | null,
  date: null as string | null,
  rateSource: getSavedSource(),
};
let listeners: Set<() => void> = new Set();
let initialized = false;

function getActiveUsd(): number {
  if (globalState.rateSource === 'universalbank' && globalState.universalbankUsd) {
    return globalState.universalbankUsd;
  }
  return globalState.nbuUsd;
}

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
        globalState.nbuUsd = data.rates.USD.rate;
        globalState.eur = data.rates.EUR?.rate || DEFAULT_EUR_RATE;
        globalState.date = data.rates.USD.date;
        globalState.universalbankUsd = data.universalbank?.USD?.sell || null;
        
        setCachedRates({
          usd: getActiveUsd(),
          eur: globalState.eur,
          nbuUsd: globalState.nbuUsd,
          universalbankUsd: globalState.universalbankUsd,
          fetchedAt: new Date().toISOString(),
          date: globalState.date!,
        });
        notifyListeners();
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    } finally {
      setSyncing(false);
    }
  }, []);

  const setRateSource = useCallback((source: RateSource) => {
    globalState.rateSource = source;
    localStorage.setItem(SETTINGS_KEY, source);
    notifyListeners();
  }, []);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      const cached = getCachedRates();
      if (cached) {
        globalState.nbuUsd = cached.nbuUsd || cached.usd;
        globalState.eur = cached.eur;
        globalState.date = cached.date;
        globalState.universalbankUsd = cached.universalbankUsd || null;
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
    usd: getActiveUsd(),
    eur: globalState.eur,
    date: globalState.date,
    syncing,
    fetchRates,
    rateSource: globalState.rateSource,
    setRateSource,
    nbuUsd: globalState.nbuUsd,
    universalbankUsd: globalState.universalbankUsd,
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
