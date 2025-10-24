"use client";

import Papa from "@/lib/papaparse-lite";
import { Card } from "@/components/Card";
import { usePortfolio } from "@/store/usePortfolio";
import { FormEvent, useMemo, useState } from "react";

type FormState = {
  ticker: string;
  quantite: number;
  prixAchat: number;
};

type CsvLigne = {
  ticker?: string;
  quantite?: string;
  prixachat?: string;
  [cle: string]: string | undefined;
};

const classeLigne =
  "grid grid-cols-[1.2fr_repeat(5,_minmax(0,_1fr))] items-center gap-3 py-2 text-sm";

const formatMonetaire = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(valeur);

const transformerHeader = (header: string) =>
  header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function PagePortefeuille() {
  const { positions, ajouterPosition, supprimerPosition, setPositions } = usePortfolio();
  const [formulaire, setFormulaire] = useState<FormState>({ ticker: "", quantite: 0, prixAchat: 0 });
  const [chargementAjout, setChargementAjout] = useState(false);
  const [messageErreurAjout, setMessageErreurAjout] = useState<string | null>(null);
  const [chargementImport, setChargementImport] = useState(false);
  const [messageErreurImport, setMessageErreurImport] = useState<string | null>(null);

  const valeurTotale = useMemo(
    () => positions.reduce((total, position) => total + position.valeur, 0),
    [positions]
  );

  const pnlTotal = useMemo(
    () => positions.reduce((total, position) => total + position.pnl, 0),
    [positions]
  );

  const ajouter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessageErreurAjout(null);

    if (!formulaire.ticker || formulaire.quantite <= 0 || formulaire.prixAchat <= 0) {
      setMessageErreurAjout("Veuillez compléter les champs avec des valeurs positives.");
      return;
    }

    try {
      setChargementAjout(true);
      const reponse = await fetch(`/api/analyse?ticker=${encodeURIComponent(formulaire.ticker.trim())}`);
      if (!reponse.ok) {
        throw new Error("API injoignable");
      }
      const donnees = await reponse.json();
      const closeSeries = Array.isArray(donnees?.closeSeries) ? donnees.closeSeries : [];
      const dernierPrix = closeSeries.length > 0 ? Number(closeSeries[closeSeries.length - 1].close) : NaN;

      if (!Number.isFinite(dernierPrix)) {
        throw new Error("Cours indisponible");
      }

      ajouterPosition({
        ticker: formulaire.ticker,
        quantite: formulaire.quantite,
        prixAchat: formulaire.prixAchat,
        dernierPrix
      });
      setFormulaire({ ticker: "", quantite: 0, prixAchat: 0 });
    } catch (error) {
      setMessageErreurAjout(
        "Impossible de récupérer le dernier cours. Vérifiez le ticker et réessayez."
      );
    } finally {
      setChargementAjout(false);
    }
  };

  const traiterCsv = async (fichier: File) => {
    setMessageErreurImport(null);
    setChargementImport(true);

    try {
      const contenu = await fichier.text();
      const { data } = Papa.parse<CsvLigne>(contenu, {
        header: true,
        skipEmptyLines: true,
        transformHeader: transformerHeader
      });

      const lignesValides = data
        .map((ligne) => ({
          ticker: ligne.ticker?.toUpperCase().trim(),
          quantite: Number(ligne.quantite),
          prixAchat: Number(ligne.prixachat)
        }))
        .filter(
          (ligne): ligne is { ticker: string; quantite: number; prixAchat: number } =>
            Boolean(ligne.ticker) &&
            Number.isFinite(ligne.quantite) &&
            ligne.quantite > 0 &&
            Number.isFinite(ligne.prixAchat) &&
            ligne.prixAchat > 0
        );

      if (lignesValides.length === 0) {
        setMessageErreurImport("Le fichier ne contient aucune ligne valide.");
        return;
      }

      const resultats = await Promise.all(
        lignesValides.map(async (ligne) => {
          try {
            const reponse = await fetch(`/api/analyse?ticker=${encodeURIComponent(ligne.ticker)}`);
            if (!reponse.ok) {
              throw new Error("Réponse invalide");
            }
            const donnees = await reponse.json();
            const closeSeries = Array.isArray(donnees?.closeSeries) ? donnees.closeSeries : [];
            const dernierPrix = closeSeries.length > 0 ? Number(closeSeries[closeSeries.length - 1].close) : NaN;

            if (!Number.isFinite(dernierPrix)) {
              throw new Error("Dernier cours manquant");
            }

            return {
              ticker: ligne.ticker,
              quantite: ligne.quantite,
              prixAchat: ligne.prixAchat,
              dernierPrix
            };
          } catch (error) {
            return {
              ticker: ligne.ticker,
              quantite: ligne.quantite,
              prixAchat: ligne.prixAchat,
              dernierPrix: ligne.prixAchat
            };
          }
        })
      );

      setPositions(resultats);
    } catch (error) {
      setMessageErreurImport(
        "Lecture du fichier impossible. Vérifiez le format CSV (Ticker, Quantité, PrixAchat)."
      );
    } finally {
      setChargementImport(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Portefeuille dynamique</h1>
        <p className="text-sm text-slate-400 md:text-base max-w-2xl">
          Importez un CSV ou ajoutez une ligne pour suivre la valeur actuelle et la performance de vos positions.
        </p>
      </header>

      <Card
        title="Importer un CSV"
        description="Colonnes requises : Ticker, Quantité, PrixAchat"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">
            Les cours sont récupérés en temps réel via l'analyse sur six mois. Un ticker invalide conservera son prix
            d'achat comme estimation.
          </p>
          <label className="inline-flex cursor-pointer flex-col gap-2 text-sm text-slate-200">
            <span>Sélectionnez votre fichier</span>
            <input
              type="file"
              accept=".csv"
              className="block rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) {
                  await traiterCsv(file);
                  event.target.value = "";
                }
              }}
              disabled={chargementImport}
            />
          </label>
        </div>
        {chargementImport && (
          <p className="mt-3 text-sm text-slate-300">Importation en cours…</p>
        )}
        {messageErreurImport && (
          <p className="mt-3 text-sm text-rose-400">{messageErreurImport}</p>
        )}
      </Card>

      <Card title="Positions actuelles" description="Vue détaillée des lignes importées ou ajoutées">
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[1.2fr_repeat(5,_minmax(0,_1fr))] gap-3 border-b border-slate-800 pb-2 text-xs uppercase tracking-wide text-slate-500">
              <span>Titre</span>
              <span>Quantité</span>
              <span>Prix d'achat</span>
              <span>Dernier prix</span>
              <span>Valeur</span>
              <span>P&amp;L</span>
            </div>
            {positions.length === 0 ? (
              <p className="py-6 text-sm text-slate-400">
                Importez un CSV ou ajoutez une ligne pour afficher votre portefeuille.
              </p>
            ) : (
              positions.map((position) => {
                const classePnl = position.pnl >= 0 ? "text-emerald-400" : "text-rose-400";
                return (
                  <div key={position.ticker} className={`${classeLigne} border-b border-slate-900/60`}>
                    <span className="font-medium text-white">{position.ticker}</span>
                    <span>{position.quantite}</span>
                    <span>{formatMonetaire(position.prixAchat)}</span>
                    <span>{formatMonetaire(position.dernierPrix)}</span>
                    <span>{formatMonetaire(position.valeur)}</span>
                    <div className="flex items-center justify-between gap-3">
                      <span className={classePnl}>{formatMonetaire(position.pnl)}</span>
                      <button
                        type="button"
                        className="text-xs text-rose-400 hover:text-rose-300"
                        onClick={() => supprimerPosition(position.ticker)}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1 text-sm text-slate-300 md:flex-row md:items-center md:gap-4">
          <span>
            Valeur totale : <strong className="text-slate-100">{formatMonetaire(valeurTotale)}</strong>
          </span>
          <span>
            P&amp;L total :
            <strong className={`ml-2 ${pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatMonetaire(pnlTotal)}
            </strong>
          </span>
        </div>
      </Card>

      <Card title="Ajouter une position" description="Simulez un nouvel investissement">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={ajouter}>
          <input
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primaire focus:outline-none"
            placeholder="Ticker"
            value={formulaire.ticker}
            onChange={(event) =>
              setFormulaire((prev) => ({ ...prev, ticker: event.target.value.toUpperCase() }))
            }
          />
          <input
            type="number"
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:border-primaire focus:outline-none"
            placeholder="Quantité"
            value={formulaire.quantite || ""}
            onChange={(event) =>
              setFormulaire((prev) => ({ ...prev, quantite: Number(event.target.value) }))
            }
          />
          <input
            type="number"
            step="0.01"
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:border-primaire focus:outline-none"
            placeholder="Prix d'achat"
            value={formulaire.prixAchat || ""}
            onChange={(event) =>
              setFormulaire((prev) => ({ ...prev, prixAchat: Number(event.target.value) }))
            }
          />
          <button
            type="submit"
            className="rounded-lg bg-primaire px-4 py-2 text-sm font-medium text-white transition hover:bg-primaire/80 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={chargementAjout}
          >
            {chargementAjout ? "Ajout en cours…" : "Ajouter la ligne"}
          </button>
        </form>
        {messageErreurAjout && (
          <p className="mt-3 text-sm text-rose-400">{messageErreurAjout}</p>
        )}
      </Card>
    </div>
  );
}
