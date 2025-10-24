# Orion Invest Web

Application Next.js 14 (App Router) pour le suivi et l'analyse d'investissements.

## Installation locale

```bash
npm install && npm run dev
```

## Build de production

```bash
npm run build
```

## Déploiement Vercel

- Sélectionner le preset **Next.js**.
- Ne pas définir manuellement de répertoire de sortie : Vercel utilisera automatiquement `.next`.

## Scripts npm disponibles

- `npm run dev` : lance le serveur de développement.
- `npm run build` : construit l'application pour la production.
- `npm run start` : démarre le serveur en mode production (port 3000).
- `npm run lint` : exécute l'analyse statique.

## Aperçu

- Interface en français, responsive et en mode sombre.
- Pages principales : Tableau de bord, Analyse, Portefeuille.
- Calculs d'indicateurs (SMA, RSI) et score prédictif via `/api/analyse`.
- Stockage global léger avec Zustand pour le portefeuille.
