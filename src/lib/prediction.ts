export type ScoreLabel = "Hausse probable" | "Baisse probable" | "Stable / incertain";

export type AnalyseScore = {
  score: number;
  label: ScoreLabel;
};

type ScoreInputs = {
  clotures: number[];
  smaCourt: number[];
  smaLong: number[];
  rsi: number[];
};

const clamp = (valeur: number, min: number, max: number) => Math.min(max, Math.max(min, valeur));

/**
 * Calcule un score synthétique suivant la règle métier spécifiée.
 */
export function determinerScore({
  clotures,
  smaCourt,
  smaLong,
  rsi
}: ScoreInputs): AnalyseScore {
  const dernierSmaCourt = smaCourt.at(-1);
  const dernierSmaLong = smaLong.at(-1);
  const dernierRsi = rsi.at(-1);

  let score = 50;

  if (Number.isFinite(dernierSmaCourt) && Number.isFinite(dernierSmaLong)) {
    score += (dernierSmaCourt as number) > (dernierSmaLong as number) ? 20 : -20;
  }

  if (Number.isFinite(dernierRsi)) {
    if ((dernierRsi as number) < 30) {
      score += 10;
    } else if ((dernierRsi as number) > 70) {
      score -= 10;
    }
  }

  const variations: number[] = [];
  for (let i = 1; i < clotures.length; i += 1) {
    const precedent = clotures[i - 1];
    const actuel = clotures[i];
    if (Number.isFinite(precedent) && Number.isFinite(actuel) && precedent !== 0) {
      variations.push((actuel - precedent) / precedent);
    }
  }

  const variationsRecents = variations.slice(-5);
  if (variationsRecents.length > 0) {
    const moyenne =
      variationsRecents.reduce((acc, valeur) => acc + valeur, 0) / variationsRecents.length;
    score += clamp(moyenne * 100, -15, 15);
  }

  score = clamp(score, 0, 100);

  let label: ScoreLabel = "Stable / incertain";
  if (score >= 60) {
    label = "Hausse probable";
  } else if (score <= 40) {
    label = "Baisse probable";
  }

  return { score: Math.round(score), label };
}
