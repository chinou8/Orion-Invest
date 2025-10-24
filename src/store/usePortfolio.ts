import { create } from "zustand";

type Position = {
  ticker: string;
  quantite: number;
  prixMoyen: number;
};

type PortfolioState = {
  positions: Position[];
  ajouterPosition: (position: Position) => void;
  mettreAJourPosition: (ticker: string, miseAJour: Partial<Position>) => void;
  supprimerPosition: (ticker: string) => void;
  reinitialiser: () => void;
};

const normaliserTicker = (ticker: string) => ticker.trim().toUpperCase();

export const usePortfolio = create<PortfolioState>((set) => ({
  positions: [
    { ticker: "AAPL", quantite: 12, prixMoyen: 154.2 },
    { ticker: "MSFT", quantite: 6, prixMoyen: 295.4 }
  ],
  ajouterPosition: (position) =>
    set((state) => {
      const ticker = normaliserTicker(position.ticker);
      const existante = state.positions.find((p) => p.ticker === ticker);
      if (existante) {
        return {
          positions: state.positions.map((p) =>
            p.ticker === ticker
              ? {
                  ticker,
                  quantite: p.quantite + position.quantite,
                  prixMoyen:
                    (p.prixMoyen * p.quantite + position.prixMoyen * position.quantite) /
                    (p.quantite + position.quantite)
                }
              : p
          )
        };
      }
      return {
        positions: [...state.positions, { ...position, ticker }]
      };
    }),
  mettreAJourPosition: (ticker, miseAJour) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.ticker === normaliserTicker(ticker) ? { ...p, ...miseAJour } : p
      )
    })),
  supprimerPosition: (ticker) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.ticker !== normaliserTicker(ticker))
    })),
  reinitialiser: () => set({ positions: [] })
}));
