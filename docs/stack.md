# Stack technique

## Web App (Next.js)

| Outil | Usage |
|---|---|
| **Next.js 16** | Framework principal — avec `proxy.ts` |
| **Shadcn/ui** | Composants UI |
| **Tailwind CSS** | Styling (via Design Tokens, pas de CSS hardcodé) |
| **Zod** | Validation de schémas |
| **Zustand** | State management |
| **Framer Motion** | Animations |
| **Resend** | Emails transactionnels |

## Règles spécifiques à Next.js / React

- **Pas de `useEffect`** — préférer les Server Components, loaders, ou alternatives RSC
- **Design Tokens obligatoires** — jamais de couleurs/tailles en dur dans le CSS

## Landing page / SEO

- **ASTRO** pour tout site vitrine, landing page, SEO classique ou programmatic SEO

## Package managers

| Contexte | Outil |
|---|---|
| Projet standard | `bun` (priorité) ou `npm` |
| Monorepo (front + back + services) | `pnpm` avec `pnpm run dev` |
