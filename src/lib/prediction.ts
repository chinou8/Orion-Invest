export type SignalLabel = "Hausse probable" | "Baisse probable" | "Stable / incertain";

export type ScoreSignalParams = {
  sma5: number[];
  sma20: number[];
  rsi: number[];
  recentReturns: number[];
};

export type ScoreSignalResult = {
  score: number;
  label: SignalLabel;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const lastFiniteValue = (values: number[]): number | undefined => {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

/**
 * Calcule le score et le libellé de signal selon la règle fournie.
 */
export function scoreSignal({
  sma5,
  sma20,
  rsi,
  recentReturns
}: ScoreSignalParams): ScoreSignalResult {
  let score = 50;

  const lastSma5 = lastFiniteValue(sma5);
  const lastSma20 = lastFiniteValue(sma20);
  if (lastSma5 !== undefined && lastSma20 !== undefined) {
    score += lastSma5 > lastSma20 ? 20 : -20;
  }

  const lastRsi = lastFiniteValue(rsi);
  if (lastRsi !== undefined) {
    if (lastRsi < 30) {
      score += 10;
    } else if (lastRsi > 70) {
      score -= 10;
    }
  }

  const finiteReturns = recentReturns.filter((value) => Number.isFinite(value));
  if (finiteReturns.length > 0) {
    const averageReturn =
      finiteReturns.reduce((accumulator, value) => accumulator + value, 0) /
      finiteReturns.length;
    score += clamp(averageReturn * 100, -15, 15);
  }

  score = clamp(score, 0, 100);

  let label: SignalLabel = "Stable / incertain";
  if (score >= 60) {
    label = "Hausse probable";
  } else if (score <= 40) {
    label = "Baisse probable";
  }

  return { score: Math.round(score), label };
}
