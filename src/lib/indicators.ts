/**
 * Calcule la moyenne mobile simple (SMA) pour une fenêtre donnée.
 */
export function sma(values: number[], window: number): number[] {
  if (window <= 0) {
    throw new Error("La fenêtre de la SMA doit être strictement positive.");
  }

  const result: number[] = [];

  for (let index = 0; index < values.length; index += 1) {
    if (index + 1 < window) {
      result.push(NaN);
      continue;
    }

    const slice = values.slice(index + 1 - window, index + 1);
    const sum = slice.reduce((accumulator, value) => accumulator + value, 0);
    result.push(sum / window);
  }

  return result;
}

/**
 * Calcule l'indice de force relative (RSI) sur une série de clôtures.
 */
export function rsi(values: number[], window = 14): number[] {
  if (window <= 0) {
    throw new Error("La fenêtre du RSI doit être strictement positive.");
  }

  if (values.length === 0) {
    return [];
  }

  const result: number[] = Array(values.length).fill(NaN);

  if (values.length <= window) {
    return result;
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let index = 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
  }

  let averageGain =
    gains.slice(0, window).reduce((accumulator, value) => accumulator + value, 0) /
    window;
  let averageLoss =
    losses.slice(0, window).reduce((accumulator, value) => accumulator + value, 0) /
    window;

  for (let index = window; index < values.length; index += 1) {
    const gain = gains[index - 1] ?? 0;
    const loss = losses[index - 1] ?? 0;

    averageGain = (averageGain * (window - 1) + gain) / window;
    averageLoss = (averageLoss * (window - 1) + loss) / window;

    if (averageLoss === 0) {
      result[index] = 100;
      continue;
    }

    const relativeStrength = averageGain / averageLoss;
    result[index] = 100 - 100 / (1 + relativeStrength);
  }

  return result;
}
