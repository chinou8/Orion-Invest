"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/Card";
import { usePortfolio } from "@/store/usePortfolio";

type FormState = {
  ticker: string;
  quantite: number;
  prixMoyen: number;
};

const ligneClasse = "grid grid-cols-[1.5fr_repeat(3,_1fr)] items-center gap-3 py-2 text-sm";

export default function PagePortefeuille() {
  const { positions, ajouterPosition, supprimerPosition } = usePortfolio();
  const [formulaire, setFormulaire] = useState<FormState>({ ticker: "", quantite: 0, prixMoyen: 0 });

  const ajouter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formulaire.ticker || formulaire.quantite <= 0 || formulaire.prixMoyen <= 0) {
      return;
    }
    ajouterPosition(formulaire);
    setFormulaire({ ticker: "", quantite: 0, prixMoyen: 0 });
  };

  const valeurTotale = positions.reduce((total, position) => total + position.quantite * position.prixMoyen, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Portefeuille dynamique</h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
          Ajoutez et gérez vos positions pour suivre rapidement l'exposition de votre portefeuille.
        </p>
      </header>

      <Card title="Positions actuelles" description="Vue détaillée des lignes détenues">
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.5fr_repeat(3,_1fr)] gap-3 border-b border-slate-800 pb-2 text-xs uppercase tracking-wide text-slate-500">
              <span>Titre</span>
              <span>Quantité</span>
              <span>Prix moyen</span>
              <span>Valeur</span>
            </div>
            {positions.map((position) => (
              <div key={position.ticker} className={`${ligneClasse} border-b border-slate-900/60`}> 
                <span className="font-medium text-white">{position.ticker}</span>
                <span>{position.quantite}</span>
                <span>{position.prixMoyen.toFixed(2)} $</span>
                <div className="flex items-center justify-between gap-3">
                  <span>{(position.quantite * position.prixMoyen).toFixed(2)} $</span>
                  <button
                    type="button"
                    className="text-xs text-rose-400 hover:text-rose-300"
                    onClick={() => supprimerPosition(position.ticker)}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Valeur totale estimée :
          <span className="ml-2 text-base font-semibold text-slate-100">{valeurTotale.toFixed(2)} $</span>
        </p>
      </Card>

      <Card title="Ajouter une position" description="Simulez un nouvel investissement">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={ajouter}>
          <input
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primaire focus:outline-none"
            placeholder="Ticker"
            value={formulaire.ticker}
            onChange={(event) => setFormulaire((prev) => ({ ...prev, ticker: event.target.value.toUpperCase() }))}
          />
          <input
            type="number"
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:border-primaire focus:outline-none"
            placeholder="Quantité"
            value={formulaire.quantite || ""}
            onChange={(event) => setFormulaire((prev) => ({ ...prev, quantite: Number(event.target.value) }))}
          />
          <input
            type="number"
            step="0.01"
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:border-primaire focus:outline-none"
            placeholder="Prix moyen"
            value={formulaire.prixMoyen || ""}
            onChange={(event) => setFormulaire((prev) => ({ ...prev, prixMoyen: Number(event.target.value) }))}
          />
          <button
            type="submit"
            className="rounded-lg bg-primaire px-4 py-2 text-sm font-medium text-white transition hover:bg-primaire/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ajouter la ligne
          </button>
        </form>
      </Card>
    </div>
  );
}
