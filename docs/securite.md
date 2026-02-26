# Securite

## Regles absolues

- **HARDENING FIRST** — La securite n'est pas optionnelle
- **Pas de valeurs hardcodees** — Toutes les cles/secrets dans les variables d'environnement (`.env`)
- **ENV obligatoire** — Aucune config sensible dans le code source
- **`NEXT_PUBLIC_*`** : expose au client → JAMAIS de secrets
- Variables serveur validees au demarrage avec Zod (`lib/env.ts`)

## Session & Cookies

**Cookie flags obligatoires** :

| Flag | Valeur | Raison |
|---|---|---|
| `httpOnly` | `true` | Empeche l'acces JavaScript (XSS) |
| `secure` | `true` (prod) | Cookie uniquement sur HTTPS |
| `sameSite` | `lax` ou `strict` | Protection CSRF de base |
| `maxAge` | Selon besoin | Expiration explicite |

**Validation de session** : Verifier la **validite** du token (signature + expiration), pas seulement sa presence. Rotation apres login/changement de mot de passe.

## Protection CSRF

- `sameSite: lax` est le minimum
- Pour mutations sensibles (paiement, mot de passe) : ajouter un token CSRF explicite
- Les frameworks d'auth (NextAuth, Clerk) gerent souvent le CSRF automatiquement

## Supabase

- **Jamais de bypass RLS** (Row Level Security)
- **Jamais de Service Role Key** exposee cote client
- **Pas de `supabaseAdmin`** pour la majorite des actions utilisateur

## Validation & Inputs

- **Sanitiser tous les inputs** utilisateur sans exception
- Validation en 3 couches : Client (UX) → Backend (securite) → DB (integrite)
- Protection contre **XSS** et **SQL Injections** systematique
- Tout `dangerouslySetInnerHTML` → `DOMPurify.sanitize()`
- Tout redirect → valider `/^\/(?!\/)/` (pas de `//`)

## Limites de taille recommandees

| Type de champ | Limite |
|---|---|
| Nom, titre, label | 200 caracteres |
| Description, bio | 2 000 caracteres |
| Contenu markdown | 500 000 caracteres |
| Email | 320 caracteres |
| Texte envoye a une API IA | 100 000 caracteres |
| Tableau (array) | 50 elements max |

## Upload fichier

- Verifier le MIME type (magic bytes, pas juste l'extension)
- Taille max serveur-side
- Jamais faire confiance a l'extension seule

## APIs

- **Rate Limiting** sur toutes les APIs exposees
- Rate limiter **cote serveur** (pas cote client seul, pas in-memory en serverless)
- Service externe recommande : Upstash, Redis, ou solution native du backend

| Operation | Limite suggeree |
|---|---|
| Login / auth | 5 req/min/IP |
| Signup | 3 req/min/IP |
| API publique | 60 req/min/IP |
| Upload fichier | 10 req/min/user |

## Autres

- **CORS** : configurer `allowedOrigins` explicitement, jamais `*` en prod
- **SSRF** : valider les URLs fournies par l'utilisateur avant fetch cote serveur
- **Headers securite** : CSP, HSTS, X-Frame-Options dans `next.config.js`
- Autorisation **deny by default** : tout est refuse, l'acces doit etre explicitement accorde

## Checklist securite

- [ ] Toute query/mutation backend → auth + scope check
- [ ] Toute route API → auth check ou documentation explicite si publique
- [ ] Tout `fetch()` → verifier `res.ok`
- [ ] Cookies de session → flags securises
- [ ] Pas de secrets dans `NEXT_PUBLIC_*`
- [ ] Pas de secrets dans le code → `.env` + `.gitignore`

> Ref: Constitution V5 §9, §22
