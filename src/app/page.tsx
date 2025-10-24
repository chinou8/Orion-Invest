import Link from "next/link";

import { Card } from "@/components/Card";
import { Chart } from "@/components/Chart";

const tickers = [
  { code: "MC.PA", nom: "LVMH" },
  { code: "AIR.PA", nom: "Airbus" },
  { code: "AAPL", nom: "Apple" },
];

const tendances = [
  { titre: "Technologie américaine", variation: "+2,4%", statut: "En hausse" },
  { titre: "Europe durable", variation: "+1,1%", statut: "Stable" },
  { titre: "Asie émergente", variation: "-0,8%", statut: "Volatil" }
];

const donneesIndice = Array.from({ length: 30 }, (_, index) => {
  const base = 100;
  const variation = Math.sin(index / 5) * 2 + index * 0.05;
  return {
    date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString(),
    valeur: base + variation,
  };
});

export default function TableauDeBord() {
  return (
    <div className="space-y-8">
      <Card
        title="Bienvenue dans Orion Invest (web)"
        description="Votre plateforme d'analyse et de suivi des marchés en temps réel."
      >
        <div className="space-y-6 text-sm md:text-base">
          <p className="text-slate-300">
            Explorez les tendances, surveillez vos positions et lancez une analyse approfondie en un
            clic.
          </p>
          <div>
            <h3 className="text-sm font-medium text-white uppercase tracking-wide mb-3">
              Exemples de tickers
            </h3>
            <ul className="flex flex-wrap gap-3">
              {tickers.map((ticker) => (
                <li key={ticker.code}>
                  <Link
                    href={`/analyse?ticker=${encodeURIComponent(ticker.code)}`}
                    className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-primaire/60 hover:bg-primaire/10 hover:text-primaire"
                  >
                    <span className="mr-2 text-primaire">{ticker.code}</span>
                    <span className="text-slate-400">{ticker.nom}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Vue d'ensemble</h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
          Suivez les marchés, les tendances et la santé de votre portefeuille en un clin d'œil.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card
          title="Performance hebdomadaire"
          description="Synthèse visuelle des indices suivis"
          footer="Sources : Yahoo Finance — données indicatives"
        >
          <Chart titre="Indice composite" sousTitre="Performance glissante sur 7 jours" points={donneesIndice} />
        </Card>
        <Card
          title="Alertes clés"
          description="Les signaux calculés automatiquement sont mis à jour toutes les heures."
        >
          <ul className="space-y-3 text-sm">
            <li className="flex items-start justify-between">
              <span>RSI élevé sur AAPL</span>
              <span className="text-emerald-400">Opportunité</span>
            </li>
            <li className="flex items-start justify-between">
              <span>SMA20 en rupture sur TSLA</span>
              <span className="text-amber-400">Surveillance</span>
            </li>
            <li className="flex items-start justify-between">
              <span>Volume inhabituel sur NVDA</span>
              <span className="text-rose-400">Alerte</span>
            </li>
          </ul>
        </Card>
      </section>

      <Card
        title="Tendances régionales"
        description="Vue synthétique des fonds thématiques suivis par Orion Invest."
      >
        <div className="grid md:grid-cols-3 gap-4">
          {tendances.map((tendance) => (
            <div key={tendance.titre} className="rounded-lg border border-slate-800 p-4">
              <h3 className="text-base font-medium text-white">{tendance.titre}</h3>
              <p className="text-sm text-slate-400">Variation 30 jours : {tendance.variation}</p>
              <p className="text-xs text-slate-500">Statut : {tendance.statut}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Secteurs"
        description="Performance simulée par grand secteur sur les 30 derniers jours."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Métaux</p>
            <p className="mt-2 text-emerald-400 text-lg font-semibold">+4,2%</p>
            <p className="text-slate-400 text-xs">Impulsion positive portée par l'aluminium.</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Technologie</p>
            <p className="mt-2 text-emerald-300 text-lg font-semibold">+3,5%</p>
            <p className="text-slate-400 text-xs">Appétit pour les valeurs IA et semi-conducteurs.</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Énergie</p>
            <p className="mt-2 text-amber-300 text-lg font-semibold">+1,1%</p>
            <p className="text-slate-400 text-xs">Rattrapage des majors européennes.</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Consommation</p>
            <p className="mt-2 text-rose-300 text-lg font-semibold">-0,7%</p>
            <p className="text-slate-400 text-xs">Pression sur le luxe et les biens discrétionnaires.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
