# Imakō — site refondu

Refonte moderne et éditoriale du site du restaurant **Imako**
(Poke bowls · Traiteur asiatique · Massages chinois · Nimy, Mons · Belgique — depuis 2005).

## Stack

Site statique, sans build : `HTML` + `CSS` + `JS` vanilla.
Hébergeable tel quel sur GitHub Pages, Netlify, Vercel ou n'importe quel CDN.

```
├── index.html
├── assets/
│   ├── styles.css     # design system + sections
│   └── script.js      # nav, tabs, reveal, counters
└── public/            # (réservé pour images si besoin plus tard)
```

## Design

- Typographie : **Fraunces** (serif éditorial) + **Inter** (texte courant)
- Palette : crème, encre noir-vert, terracotta, nori profond, ponzu — clins d'œil aux ingrédients
- Sans dépendances JS/CSS, score Lighthouse cible 95+ sans optimisation supplémentaire
- Accessibilité : repères ARIA sur la nav et les onglets, focus visible préservé,
  `prefers-reduced-motion` respecté

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Données reprises du site historique

Adresse, horaires, téléphone, carte (extraits) et expériences proviennent de
[imakopoke.com](https://www.imakopoke.com). Les visuels sont entièrement
recréés en CSS (poke bowls, assiettes) — aucune image tierce n'est embarquée.
