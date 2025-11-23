// src/lib/analysis/types.ts

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
  smaShort: number | null;
  smaLong: number | null;
  ema: number | null;
  rsi: number | null;
  macd:
    | {
        macdLine: number;
        signalLine: number;
        histogram: number;
      }
    | null;
  bollinger:
    | {
        upper: number;
        middle: number;
        lower: number;
      }
    | null;
  signals: string[];
}

// 4. Actif fondamental
export interface FundamentalAsset {
  isin: string;
  ticker: string;
  name: string;
  country: string;
  sector: string;
  currency: string;
  marketCap: number;
  pe: number;
  pb: number;
  roe: number;
  roic: number;
  dividendYield: number;
  netDebtToEquity: number;
  [key: string]: string | number | undefined;
}

// 5. Décomposition du score fondamental
export interface FundamentalScoreBreakdown {
  valuation: number;
  profitability: number;
  financialHealth: number;
  dividend: number;
}

// 6. Filtres du screener
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

// 7. Actif fondamental avec score (utilisé par le screener)
export interface ScoredAsset {
  asset: FundamentalAsset;
  score: number;
  breakdown: FundamentalScoreBreakdown;
}

// 6. Actif fondamental avec score (utilisé par le screener)
export interface ScoredAsset extends FundamentalAsset {
  score?: number;
}
