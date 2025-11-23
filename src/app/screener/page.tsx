"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/Card";
import { runScreener } from "@/lib/analysis/screener";
import { scoreAssets } from "@/lib/analysis/fundamental";
import { ScreenerFilter, ScoredAsset } from "@/lib/analysis/types";
import { sampleAssets } from "@/lib/data/sampleAssets";

const formatNombre = (valeur: number, decimals = 1) =>
  Number.isFinite(valeur) ? valeur.toFixed(decimals) : "-";

const champsFiltres = {
  minRoe: {
    label: "ROE min (%)",
    placeholder: "15",
    step: 1
  },
  maxPe: {
    label: "PER max",
    placeholder: "30",
    step: 0.5
  },
  minScore: {
    label: "Score min",
    placeholder: "60",
    step: 1
  }
};

type TechnicalSummary = {
  ticker: string;
  rsiSignal: string;
  movingAverageCross: string;
};

export default function ScreenerPage() {
  const [minRoe, setMinRoe] = useState<number>(10);
  const [maxPe, setMaxPe] = useState<number>(40);
  const [minScore, setMinScore] = useState<number>(0);
  const [sector, setSector] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set());
  const [technicalSummaries, setTechnicalSummaries] = useState<Record<string, TechnicalSummary>>({});
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [errorSignals, setErrorSignals] = useState<string | null>(null);

  const allSectors = useMemo(
    () => Array.from(new Set(sampleAssets.map((asset) => asset.sector))).sort(),
    []
  );
  const allCountries = useMemo(
    () => Array.from(new Set(sampleAssets.map((asset) => asset.country))).sort(),
    []
  );

  const filters = useMemo(() => {
    const activeFilters: ScreenerFilter[] = [];
    if (Number.isFinite(minRoe) && minRoe > 0) {
      activeFilters.push({ field: "roe", operator: ">=", value: minRoe });
    }
    if (Number.isFinite(maxPe) && maxPe > 0) {
      activeFilters.push({ field: "pe", operator: "<=", value: maxPe });
    }
    if (sector) {
      activeFilters.push({ field: "sector", operator: "in", value: [sector] });
    }
    if (country) {
      activeFilters.push({ field: "country", operator: "in", value: [country] });
    }
    return activeFilters;
  }, [minRoe, maxPe, sector, country]);

  const scoredAssets = useMemo(() => {
    const screened = runScreener(sampleAssets, filters);
    const scored = scoreAssets(screened);
    return scored.filter((item) => (item.score ?? 0) >= minScore);
  }, [filters, minScore]);

  useEffect(() => {
    if (selectedTickers.size === 0) {
      setTechnicalSummaries({});
      return;
    }

    const controller = new AbortController();
    const loadSignals = async () => {
      setLoadingSignals(true);
      setErrorSignals(null);
      try {
        const results = await Promise.all(
          Array.from(selectedTickers).map(async (ticker) => {
            const response = await fetch(`/api/analysis/technicals?ticker=${encodeURIComponent(ticker)}`, {
              signal: controller.signal
            });
            if (!response.ok) {
              throw new Error("Erreur réseau");
            }
            const data = await response.json();
            return {
              ticker: ticker.toUpperCase(),
              rsiSignal: data?.signals?.rsiSignal ?? "neutral",
              movingAverageCross: data?.signals?.movingAverageCross ?? "none"
            } as TechnicalSummary;
          })
        );
        const map = Object.fromEntries(results.map((result) => [result.ticker, result]));
        setTechnicalSummaries(map);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorSignals("Impossible de récupérer les signaux techniques en ce moment.");
          setTechnicalSummaries({});
        }
      } finally {
        setLoadingSignals(false);
      }
    };

    loadSignals();

    return () => controller.abort();
  }, [selectedTickers]);

  const toggleSelection = (ticker: string) => {
    setSelectedTickers((prev) => {
      const updated = new Set(prev);
      if (updated.has(ticker)) {
        updated.delete(ticker);
      } else {
        updated.add(ticker);
      }
      return updated;
    });
  };

  const renderSignalBadge = (value: string) => {
    switch (value) {
      case "overbought":
      case "bearish":
        return <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-300">{value}</span>;
      case "oversold":
      case "bullish":
        return (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{value}</span>
        );
      default:
        return <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{value}</span>;
    }
  };

  return (
    <div className="space-y-8 py-8 px-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Screener & signaux Orion</h1>
        <p className="text-sm text-slate-400 md:text-base max-w-3xl">
          Filtrez vos actifs par critères fondamentaux, attribuez-leur un score et consultez les signaux
          techniques clés sur la sélection.
        </p>
      </header>

      <Card title="Filtres fondamentaux" description="Appliquez des garde-fous simples avant scoring.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>{champsFiltres.minRoe.label}</span>
            <input
              type="number"
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-primaire focus:outline-none"
              placeholder={champsFiltres.minRoe.placeholder}
              step={champsFiltres.minRoe.step}
              value={minRoe}
              onChange={(event) => setMinRoe(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>{champsFiltres.maxPe.label}</span>
            <input
              type="number"
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-primaire focus:outline-none"
              placeholder={champsFiltres.maxPe.placeholder}
              step={champsFiltres.maxPe.step}
              value={maxPe}
              onChange={(event) => setMaxPe(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>{champsFiltres.minScore.label}</span>
            <input
              type="number"
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-primaire focus:outline-none"
              placeholder={champsFiltres.minScore.placeholder}
              step={champsFiltres.minScore.step}
              value={minScore}
              onChange={(event) => setMinScore(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Secteur</span>
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-primaire focus:outline-none"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              <option value="">Tous</option>
              {allSectors.map((option) => {
                const value = String(option);
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Pays</span>
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-primaire focus:outline-none"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              <option value="">Tous</option>
              {allCountries.map((option) => {
                const value = String(option);
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
      </Card>

      <Card
        title="Résultats du screener"
        description="Assets triés par score fondamental décroissant. Cochez pour voir les signaux techniques."
      >
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[0.5fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-3 border-b border-slate-800 pb-2 text-xs uppercase tracking-wide text-slate-500">
              <span>Sélect.</span>
              <span>Actif</span>
              <span>Sector / Pays</span>
              <span>PER / PB</span>
              <span>ROE / ROIC</span>
              <span>Dette nette / FP</span>
              <span>Dividende</span>
              <span>Score</span>
            </div>
            {scoredAssets.length === 0 ? (
              <p className="py-6 text-sm text-slate-400">Aucun actif ne correspond aux filtres en cours.</p>
            ) : (
              scoredAssets.map((item) => {
                const { asset, score, breakdown } = item as ScoredAsset;
                return (
                  <div
                    key={asset.isin}
                    className="grid grid-cols-[0.5fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr] items-center gap-3 border-b border-slate-900/60 py-3 text-sm"
                  >
                    <div>
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner ${asset.ticker}`}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-primaire focus:ring-primaire"
                        checked={selectedTickers.has(asset.ticker)}
                        onChange={() => toggleSelection(asset.ticker)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{asset.name}</span>
                      <span className="text-xs text-slate-400">{asset.ticker}</span>
                    </div>
                    <div className="text-slate-300">
                      <div className="text-sm">{asset.sector}</div>
                      <div className="text-xs text-slate-500">{asset.country}</div>
                    </div>
                    <div className="text-slate-200">
                      <div>PE {formatNombre(asset.pe)}</div>
                      <div className="text-xs text-slate-500">PB {formatNombre(asset.pb)}</div>
                    </div>
                    <div className="text-slate-200">
                      <div>ROE {formatNombre(asset.roe)}%</div>
                      <div className="text-xs text-slate-500">ROIC {formatNombre(asset.roic)}%</div>
                    </div>
                    <div className="text-slate-200">
                      <div>{formatNombre(asset.netDebtToEquity, 0)}%</div>
                      <div className="text-xs text-slate-500">Santé : {formatNombre(breakdown.financialHealth)} / 100</div>
                    </div>
                    <div className="text-slate-200">
                      <div>{formatNombre(asset.dividendYield)}%</div>
                      <div className="text-xs text-slate-500">Score pilier : {formatNombre(breakdown.dividend)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-white">{score}</span>
                      <div className="text-xs text-slate-500">Val {breakdown.valuation} / Prof {breakdown.profitability}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>

      <Card
        title="Signaux techniques sur la sélection"
        description="Les indicateurs se basent sur 6 mois de données Yahoo Finance."
      >
        {selectedTickers.size === 0 ? (
          <p className="text-sm text-slate-400">Sélectionnez un ou plusieurs actifs pour afficher les signaux.</p>
        ) : (
          <div className="space-y-3">
            {loadingSignals && <p className="text-sm text-slate-300">Chargement des signaux…</p>}
            {errorSignals && <p className="text-sm text-rose-400">{errorSignals}</p>}
            {!loadingSignals && !errorSignals && (
              <ul className="space-y-3">
                {Array.from(selectedTickers).map((ticker) => {
                  const summary = technicalSummaries[ticker.toUpperCase()];
                  return (
                    <li
                      key={ticker}
                      className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{ticker}</p>
                        <p className="text-xs text-slate-400">Analyse technique</p>
                      </div>
                      {summary ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 text-sm text-slate-200">
                            <span className="text-slate-400">RSI</span>
                            {renderSignalBadge(summary.rsiSignal)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-200">
                            <span className="text-slate-400">Moyennes mobiles</span>
                            {renderSignalBadge(summary.movingAverageCross)}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Signaux en cours de récupération…</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Analyse générée plus tard</span>
            <textarea
              className="min-h-[120px] rounded-lg border border-dashed border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primaire focus:outline-none"
              placeholder="Zone réservée pour une synthèse automatique des signaux et fondamentaux."
              disabled
            />
          </label>
        </div>
      </Card>
    </div>
  );
}
