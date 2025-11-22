import { rsi as calculateRSISeries, sma as calculateSMASeries } from "@/lib/indicators";

import {
  BollingerBands,
  MACDResult,
  PriceCandle,
  TechnicalSignals,
  TechnicalSnapshot
} from "./types";

const extractCloses = (candles: PriceCandle[]): number[] =>
  candles.map((candle) => candle.close);

const calculateEMAFromSeries = (series: number[], period: number): number[] => {
  const result = Array(series.length).fill(NaN);

  if (period <= 0) {
    throw new Error("La période de l'EMA doit être strictement positive.");
  }

  const multiplier = 2 / (period + 1);

  // Trouver la première fenêtre complète de valeurs finies pour initialiser l'EMA
  for (let startIndex = 0; startIndex + period <= series.length; startIndex += 1) {
    const window = series.slice(startIndex, startIndex + period);
    if (!window.every(Number.isFinite)) {
      continue;
    }

    const initial =
      window.reduce((accumulator, value) => accumulator + (value as number), 0) / period;
    const anchorIndex = startIndex + period - 1;
    result[anchorIndex] = initial;

    for (let index = anchorIndex + 1; index < series.length; index += 1) {
      const value = series[index];
      if (!Number.isFinite(value)) {
        result[index] = result[index - 1];
        continue;
      }
      result[index] = (value - result[index - 1]) * multiplier + result[index - 1];
    }

    break;
  }

  return result;
};

export const calculateSMA = (candles: PriceCandle[], period: number): number[] =>
  calculateSMASeries(extractCloses(candles), period);

export const calculateEMA = (candles: PriceCandle[], period: number): number[] =>
  calculateEMAFromSeries(extractCloses(candles), period);

export const calculateRSI = (candles: PriceCandle[], period = 14): number[] =>
  calculateRSISeries(extractCloses(candles), period);

export const calculateMACD = (
  candles: PriceCandle[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDResult => {
  const fastEma = calculateEMA(candles, fast);
  const slowEma = calculateEMA(candles, slow);

  const macd = fastEma.map((value, index) => value - (slowEma[index] ?? 0));
  const signalLine = calculateEMAFromSeries(macd, signal);
  const histogram = macd.map((value, index) => value - (signalLine[index] ?? 0));

  return { macd, signal: signalLine, histogram };
};

export const calculateBollingerBands = (
  candles: PriceCandle[],
  period = 20,
  stdDev = 2
): BollingerBands => {
  const closes = extractCloses(candles);
  const middle = calculateSMASeries(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let index = 0; index < closes.length; index += 1) {
    if (index + 1 < period) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }

    const slice = closes.slice(index + 1 - period, index + 1);
    const mean = middle[index];
    const variance =
      slice.reduce((accumulator, value) => accumulator + Math.pow(value - mean, 2), 0) / period;
    const deviation = Math.sqrt(variance) * stdDev;

    upper.push(mean + deviation);
    lower.push(mean - deviation);
  }

  return { upper, middle, lower };
};

export const detectRSISignal = (
  rsiSeries: number[],
  { overbought = 70, oversold = 30 }: { overbought?: number; oversold?: number } = {}
): TechnicalSignals["rsiSignal"] => {
  const last = rsiSeries.filter((value) => Number.isFinite(value)).at(-1);

  if (last === undefined) {
    return "neutral";
  }

  if (last >= overbought) {
    return "overbought";
  }

  if (last <= oversold) {
    return "oversold";
  }

  return "neutral";
};

export const detectMovingAverageCross = (
  shortMA: number[],
  longMA: number[]
): TechnicalSignals["movingAverageCross"] => {
  const length = Math.min(shortMA.length, longMA.length);

  for (let index = length - 1; index > 0; index -= 1) {
    const previousShort = shortMA[index - 1];
    const previousLong = longMA[index - 1];
    const currentShort = shortMA[index];
    const currentLong = longMA[index];

    if (
      Number.isFinite(previousShort) &&
      Number.isFinite(previousLong) &&
      Number.isFinite(currentShort) &&
      Number.isFinite(currentLong)
    ) {
      if (previousShort <= previousLong && currentShort > currentLong) {
        return "bullish";
      }

      if (previousShort >= previousLong && currentShort < currentLong) {
        return "bearish";
      }

      break;
    }
  }

  return "none";
};

export const buildTechnicalSnapshot = (
  candles: PriceCandle[],
  options: {
    smaShortPeriod?: number;
    smaLongPeriod?: number;
    emaPeriod?: number;
    rsiPeriod?: number;
  } = {}
): TechnicalSnapshot => {
  const closes = extractCloses(candles);
  const smaShort = calculateSMA(candles, options.smaShortPeriod ?? 20);
  const smaLong = calculateSMA(candles, options.smaLongPeriod ?? 50);
  const ema = calculateEMA(candles, options.emaPeriod ?? 20);
  const rsi = calculateRSI(candles, options.rsiPeriod ?? 14);
  const macd = calculateMACD(candles);
  const bollinger = calculateBollingerBands(candles);

  const signals: TechnicalSignals = {
    rsiSignal: detectRSISignal(rsi),
    movingAverageCross: detectMovingAverageCross(smaShort, smaLong)
  };

  return {
    closes,
    smaShort,
    smaLong,
    ema,
    rsi,
    macd,
    bollinger,
    signals
  };
};
