"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/Card";

type AnalyseResponse = {
  ticker: string;
  closeSeries: number[];
  sma5: number[];
  sma20: number[];
  rsi14: number[];
  score: number;
  label: string;
};

const inputClasses =
  "flex-1 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primaire focus:outline-none";
const boutonClasses =
  "rounded-lg bg-primaire px-4 py-2 text-sm font-medium text-white transition hover:bg-primaire/80 disabled:cursor-not-allowed disabled:opacity-60";

export default function PageAnalyse() {
  const [ticker, setTicker] = useState("AAPL");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [donnees, setDonnees] = useState<AnalyseResponse | null>(null);

  const chargerDonnees = useCallback(async (symbole: string) => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/analyse?ticker=${encodeURIComponent(symbole)}`);
      if (!reponse.ok) {
        throw new Error("Impossible de récupérer les données.");
      }
      const payload = (await reponse.json()) as AnalyseResponse;
      setDonnees(payload);
    } catch (err) {
      console.error(err);
      setErreur("Une erreur est survenue lors de l'analyse.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void chargerDonnees("AAPL");
  }, [chargerDonnees]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Analyse intelligente</h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
          Calculez automatiquement les indicateurs clés et recevez une interprétation du signal de marché.
        </p>
      </header>

      <Card title="Rechercher un ticker" description="Saisissez un symbole coté sur les marchés US">
        <form
          className="flex flex-col gap-4 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!ticker) return;
            void chargerDonnees(ticker);
          }}
        >
          <input
            className={inputClasses}
            placeholder="Ex. AAPL"
            value={ticker}
            onChange={(event) => setTicker(event.target.value.toUpperCase())}
          />
          <button type="submit" className={boutonClasses} disabled={chargement}>
            {chargement ? "Analyse en cours..." : "Lancer l'analyse"}
          </button>
        </form>
        {erreur ? <p className="text-sm text-rose-400">{erreur}</p> : null}
      </Card>

      {donnees ? (
        <Card
          title={`Résultats pour ${donnees.ticker}`}
          description="Résumé des indicateurs techniques calculés sur les 60 derniers jours."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-slate-800 p-4">
              <h3 className="text-base font-medium text-white">Score global</h3>
              <p className="text-4xl font-semibold text-primaire">{donnees.score}</p>
              <p className="text-sm text-slate-400">{donnees.label}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-800 p-4 text-sm text-slate-300">
              <p>
                SMA 5 jours :
                <span className="ml-2 font-medium text-slate-100">
                  {donnees.sma5.at(-1)?.toFixed(2) ?? "N/A"}
                </span>
              </p>
              <p>
                SMA 20 jours :
                <span className="ml-2 font-medium text-slate-100">
                  {donnees.sma20.at(-1)?.toFixed(2) ?? "N/A"}
                </span>
              </p>
              <p>
                RSI 14 jours :
                <span className="ml-2 font-medium text-slate-100">
                  {donnees.rsi14.at(-1)?.toFixed(2) ?? "N/A"}
                </span>
              </p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
