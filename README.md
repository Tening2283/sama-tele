# 📺 Télé Monde

Une télé rétro : tu choisis un pays, elle zappe sur un film de ce pays et passe sa **bande-annonce officielle**.
Elle affiche aussi les infos du film et **où le regarder légalement**.

## Installation

```bash
npm install
cp .env.example .env   # puis mets ta clé TMDB dans .env
npm run dev
```

Ouvre ensuite http://localhost:5173

## Obtenir une clé TMDB

1. Crée un compte sur https://www.themoviedb.org
2. Paramètres → API → « Request an API Key » → Developer
3. Copie l'**API Key (v3)** dans `.env` : `VITE_TMDB_API_KEY=...`

## Droits d'auteur

Cette application **n'héberge et ne diffuse aucun film**.

- Les bandes-annonces sont lues depuis YouTube via le lecteur officiel.
- Les informations et affiches viennent de l'API TMDB.
- Les offres de streaming viennent de JustWatch (via TMDB).

This product uses the TMDB API but is not endorsed or certified by TMDB.
