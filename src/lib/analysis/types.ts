// Fichier : src/lib/analysis/types.ts

export interface PriceCandle {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  symbol: string;
  price: number;
  trend: 'HAUSSIER' | 'BAISSIER' | 'NEUTRE';
  rsi: number;
  recommendation: string;
}

export interface TechnicalSnapshot {
  smaShort: number | null;
  smaLong: number | null;
  ema: number | null;
  rsi: number | null;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  } | null;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  } | null;
  signals: string[];
}
