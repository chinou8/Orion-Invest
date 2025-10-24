/**
 * Implémentation minimale inspirée de PapaParse pour parser un CSV côté client
 * dans un environnement hors-ligne. Elle gère les en-têtes, les lignes vides et
 * les guillemets doubles conformément aux besoins du portefeuille.
 */

type ParseConfig = {
  header?: boolean;
  skipEmptyLines?: boolean;
  transformHeader?: (header: string) => string;
};

type ParseResult<T> = {
  data: T[];
};

const nettoyerHeader = (header: string, transformHeader?: ParseConfig["transformHeader"]) => {
  const nettoye = header.trim();
  return transformHeader ? transformHeader(nettoye) : nettoye;
};

const parserLigne = (ligne: string): string[] => {
  const valeurs: string[] = [];
  let courant = "";
  let entreGuillemets = false;

  for (let index = 0; index < ligne.length; index += 1) {
    const caractere = ligne[index];

    if (caractere === "\"") {
      const prochain = ligne[index + 1];
      if (entreGuillemets && prochain === "\"") {
        courant += "\"";
        index += 1;
      } else {
        entreGuillemets = !entreGuillemets;
      }
      continue;
    }

    if (caractere === "," && !entreGuillemets) {
      valeurs.push(courant);
      courant = "";
      continue;
    }

    courant += caractere;
  }

  valeurs.push(courant);
  return valeurs;
};

const parse = <T extends Record<string, string | undefined>>(
  source: string,
  config: ParseConfig = {}
): ParseResult<T> => {
  const lignes = source.split(/\r?\n|\r/);
  const data: T[] = [];
  let headers: string[] | null = null;

  lignes.forEach((ligneBrute, index) => {
    if (config.skipEmptyLines && ligneBrute.trim() === "") {
      return;
    }

    const valeurs = parserLigne(ligneBrute).map((valeur) => valeur.trim());

    if (index === 0 && config.header) {
      headers = valeurs.map((header) => nettoyerHeader(header, config.transformHeader));
      return;
    }

    if (config.header) {
      if (!headers) {
        throw new Error("Aucun en-tête détecté pour le CSV importé.");
      }

      const entree: Record<string, string> = {};
      headers.forEach((header, position) => {
        entree[header] = valeurs[position] ?? "";
      });
      data.push(entree as T);
      return;
    }

    data.push(valeurs as unknown as T);
  });

  return { data };
};

const Papa = { parse };

export type { ParseConfig, ParseResult };
export default Papa;
