// src/lib/analysis/types.ts

import type { FundamentalAsset, FundamentalScoreBreakdown } from "./fundamental";

export type { FundamentalAsset, FundamentalScoreBreakdown } from "./fundamental";

// 1. Structure d'une bougie (Prix)
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
  trend: "HAUSSIER" | "BAISSIER" | "NEUTRE";
  rsi: number;
  recommendation: string;
}

// 3. Indicateurs techniques
export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export interface BollingerBands {
  upper: number[];
  middle: number[];
  lower: number[];
}

export interface TechnicalSignals {
  rsiSignal: "overbought" | "oversold" | "neutral";
  movingAverageCross: "bullish" | "bearish" | "none";
}

// 4. Instantané technique (pour graphiques et indicateurs)
export interface TechnicalSnapshot {
  closes: number[];
  smaShort: number[];
  smaLong: number[];
  ema: number[];
  rsi: number[];
  macd: MACDResult;
  bollinger: BollingerBands;
  signals: TechnicalSignals;
}

// 5. Filtres du screener
export type ScreenerNumericFilter = {
  field: keyof FundamentalAsset;
  operator: ">=" | "<=" | ">" | "<";
  value: number;
};

export type ScreenerInFilter = {
  field: keyof FundamentalAsset;
  operator: "in";
  value: string[];
};

export type ScreenerFilter = ScreenerNumericFilter | ScreenerInFilter;

// 6. Actif fondamental avec score (utilisé par le screener)

export interface ScoredAsset extends FundamentalAsset {
  score: number;
  breakdown: FundamentalScoreBreakdown;
}
