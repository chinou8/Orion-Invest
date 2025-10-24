# Orion Invest Web

Application Next.js 14 (App Router) pour le suivi et l'analyse d'investissements.

## Installation

```bash
npm install
```

## Scripts npm

- `npm run dev` : lance le serveur de développement.
- `npm run build` : construit l'application pour la production.
- `npm run start` : démarre le serveur en mode production.
- `npm run lint` : exécute l'analyse statique.

## Aperçu

- Interface en français, responsive et en mode sombre.
- Pages principales : Tableau de bord, Analyse, Portefeuille.
- Calculs d'indicateurs (SMA, RSI) et score prédictif via `/api/analyse`.
- Stockage global léger avec Zustand pour le portefeuille.
