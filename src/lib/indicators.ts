/**
 * Calcule la moyenne mobile simple (SMA) sur une série de prix.
 */
export function calculerSMA(valeurs: number[], periode: number): number[] {
  if (periode <= 0) {
    throw new Error("La période de la SMA doit être positive.");
  }
  const resultat: number[] = [];
  for (let i = 0; i < valeurs.length; i += 1) {
    if (i + 1 < periode) {
      resultat.push(NaN);
      continue;
    }
    const segment = valeurs.slice(i + 1 - periode, i + 1);
    const somme = segment.reduce((acc, valeur) => acc + valeur, 0);
    resultat.push(somme / periode);
  }
  return resultat;
}

/**
 * Calcule l'indice de force relative (RSI) sur une série de prix de clôture.
 */
export function calculerRSI(valeurs: number[], periode = 14): number[] {
  if (periode <= 0) {
    throw new Error("La période du RSI doit être positive.");
  }
  if (valeurs.length === 0) {
    return [];
  }

  const resultat: number[] = Array(valeurs.length).fill(NaN);
  if (valeurs.length <= periode) {
    return resultat;
  }

  const gains: number[] = [];
  const pertes: number[] = [];

  for (let i = 1; i < valeurs.length; i += 1) {
    const variation = valeurs[i] - valeurs[i - 1];
    gains.push(Math.max(0, variation));
    pertes.push(Math.max(0, -variation));
  }

  let moyenneGain = gains.slice(0, periode).reduce((acc, valeur) => acc + valeur, 0) / periode;
  let moyennePerte = pertes.slice(0, periode).reduce((acc, valeur) => acc + valeur, 0) / periode;

  for (let i = periode; i < valeurs.length; i += 1) {
    const gain = gains[i - 1] ?? 0;
    const perte = pertes[i - 1] ?? 0;
    moyenneGain = (moyenneGain * (periode - 1) + gain) / periode;
    moyennePerte = (moyennePerte * (periode - 1) + perte) / periode;

    const index = i;
    if (moyennePerte === 0) {
      resultat[index] = 100;
    } else {
      const rs = moyenneGain / moyennePerte;
      resultat[index] = 100 - 100 / (1 + rs);
    }
  }

  return resultat;
}
