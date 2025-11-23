// Fundamental analysis domain models
export type FundamentalAsset = {
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
};

export type NumericField =
  | "marketCap"
  | "pe"
  | "pb"
  | "roe"
  | "roic"
  | "dividendYield"
  | "netDebtToEquity";

export type StringField = "country" | "sector" | "currency";

export type NumericFilterOperator = ">=" | "<=" | ">" | "<";

export type InclusionOperator = "in";

export type ScreenerNumericFilter = {
  field: NumericField;
  operator: NumericFilterOperator;
  value: number;
};

export type ScreenerInFilter = {
  field: StringField;
  operator: InclusionOperator;
  value: string[];
};

export type ScreenerFilter = ScreenerNumericFilter | ScreenerInFilter;

export type ScreenerFilters = ScreenerFilter[];

export type FundamentalScoreBreakdown = {
  valuation: number;
  profitability: number;
  financialHealth: number;
  dividend: number;
};

export type ScoredAsset = {
  asset: FundamentalAsset;
  score: number;
  breakdown: FundamentalScoreBreakdown;
};

// Technical analysis domain models
export interface PriceCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type MACDResult = {
  macd: number[];
  signal: number[];
  histogram: number[];
};

export type BollingerBands = {
  upper: number[];
  middle: number[];
  lower: number[];
};

export type TechnicalSignals = {
  rsiSignal: "overbought" | "oversold" | "neutral";
  movingAverageCross: "bullish" | "bearish" | "none";
};

export type TechnicalSnapshot = {
  closes: number[];
  smaShort: number[];
  smaLong: number[];
  ema: number[];
  rsi: number[];
  macd: MACDResult;
  bollinger: BollingerBands;
  signals: TechnicalSignals;
};
