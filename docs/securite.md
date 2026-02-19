# Sécurité

## Règles absolues

- **HARDENING FIRST** — La sécurité n'est pas optionnelle
- **Pas de valeurs hardcodées** — Toutes les clés/secrets dans les variables d'environnement (`.env`)
- **ENV obligatoire** — Aucune config sensible dans le code source

## Supabase

- **Jamais de bypass RLS** (Row Level Security)
- **Jamais de Service Role Key** exposée côté client
- **Pas de `supabaseAdmin`** pour la majorité des actions utilisateur

## Validation & Inputs

- **Sanitiser tous les inputs** utilisateur sans exception
- Définir une **longueur maximale** (Max Char.) sur chaque champ de formulaire
- Protection contre **XSS** et **SQL Injections** systématique

## APIs

- Implémenter du **Rate Limiting** sur toutes les APIs exposées
