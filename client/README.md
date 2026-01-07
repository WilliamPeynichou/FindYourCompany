# TrouveTaBoite - Client

Application React avec Vite, React Router DOM et Tailwind CSS.

## Technologies

- **React** - Bibliothèque JavaScript pour construire des interfaces utilisateur
- **Vite** - Outil de build rapide et moderne
- **React Router DOM** - Routage côté client pour React
- **Tailwind CSS** - Framework CSS utilitaire

## Installation

Les dépendances sont déjà installées. Si besoin :

```bash
npm install
```

## Démarrage

### Mode développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (ou un autre port si celui-ci est occupé).

### Build pour production
```bash
npm run build
```

### Prévisualiser le build de production
```bash
npm run preview
```

## Structure

- `src/` - Code source de l'application
  - `App.jsx` - Composant principal avec les routes
  - `main.jsx` - Point d'entrée de l'application
  - `index.css` - Styles Tailwind CSS
- `public/` - Fichiers statiques
- `tailwind.config.js` - Configuration Tailwind CSS
- `postcss.config.js` - Configuration PostCSS
