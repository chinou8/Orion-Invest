// src/lib/analysis/types.ts

// 1. Structure d'une bougie (Prix) - C'est ce qui manquait pour l'erreur
export interface PriceCandle {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 2. Résultat général d'une analyse
export interface AnalysisResult {
  symbol: string;
  price: number;
  trend: 'HAUSSIER' | 'BAISSIER' | 'NEUTRE';
  rsi: number;
  recommendation: string;
}

// 3. Instantané technique (pour tes graphiques et indicateurs)
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
