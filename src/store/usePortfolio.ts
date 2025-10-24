import { create } from "zustand";

type PositionBase = {
  ticker: string;
  quantite: number;
  prixAchat: number;
  dernierPrix: number;
};

export type Position = PositionBase & {
  valeur: number;
  pnl: number;
};

type PortfolioState = {
  positions: Position[];
  setPositions: (positions: PositionBase[]) => void;
  ajouterPosition: (position: PositionBase) => void;
  supprimerPosition: (ticker: string) => void;
  reinitialiser: () => void;
};

const normaliserTicker = (ticker: string) => ticker.trim().toUpperCase();

const calculerPosition = (position: PositionBase): Position => {
  const quantite = position.quantite;
  const prixAchat = position.prixAchat;
  const dernierPrix = position.dernierPrix;
  const coutTotal = quantite * prixAchat;
  const valeur = quantite * dernierPrix;

  return {
    ticker: normaliserTicker(position.ticker),
    quantite,
    prixAchat,
    dernierPrix,
    valeur,
    pnl: valeur - coutTotal
  };
};

const agregerPositions = (positions: PositionBase[]): Position[] => {
  const regroupement = new Map<
    string,
    { quantite: number; coutTotal: number; dernierPrix: number }
  >();

  positions.forEach((position) => {
    const ticker = normaliserTicker(position.ticker);
    const quantite = position.quantite;
    const prixAchat = position.prixAchat;
    const dernierPrix = position.dernierPrix;

    if (!Number.isFinite(quantite) || quantite <= 0) {
      return;
    }

    const coutTotal = prixAchat * quantite;
    const existant = regroupement.get(ticker);

    if (existant) {
      regroupement.set(ticker, {
        quantite: existant.quantite + quantite,
        coutTotal: existant.coutTotal + coutTotal,
        dernierPrix
      });
    } else {
      regroupement.set(ticker, { quantite, coutTotal, dernierPrix });
    }
  });

  return Array.from(regroupement.entries()).map(([ticker, resume]) => {
    const quantite = resume.quantite;
    const prixAchat = quantite === 0 ? 0 : resume.coutTotal / quantite;

    return calculerPosition({
      ticker,
      quantite,
      prixAchat,
      dernierPrix: resume.dernierPrix
    });
  });
};

const toBasePositions = (positions: Position[]): PositionBase[] =>
  positions.map(({ ticker, quantite, prixAchat, dernierPrix }) => ({
    ticker,
    quantite,
    prixAchat,
    dernierPrix
  }));

export const usePortfolio = create<PortfolioState>((set) => ({
  positions: [],
  setPositions: (nouvellesPositions) =>
    set({ positions: agregerPositions(nouvellesPositions) }),
  ajouterPosition: (position) =>
    set((state) => {
      const existantes = toBasePositions(state.positions);
      return {
        positions: agregerPositions([...existantes, position])
      };
    }),
  supprimerPosition: (ticker) =>
    set((state) => ({
      positions: state.positions.filter(
        (position) => position.ticker !== normaliserTicker(ticker)
      )
    })),
  reinitialiser: () => set({ positions: [] })
}));
