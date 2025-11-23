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

// 3. Instantané technique (pour graphiques et indicateurs)
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

// 4. Actif fondamental (type générique pour l'instant)
export interface FundamentalAsset {
  [key: string]: unknown;
}

// 5. Filtre de screener (type générique pour l'instant)
export interface ScreenerFilter {
  [key: string]: unknown;
}
