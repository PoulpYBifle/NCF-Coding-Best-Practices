# Qualite du code

## Pyramide d'enforcement

```
        CI            ← Dernier filet. Bloquant. Rien ne merge si ca echoue.
      pre-push        ← Tests + types. Avant d'envoyer sur le remote.
    pre-commit        ← Format + lint. Rapide (< 10s).
   IDE (save)         ← Feedback instantane. Format auto.
```

| Couche | Quand | Quoi | Duree cible |
|---|---|---|---|
| **IDE** | A chaque save | Format auto + erreurs temps reel | Instantane |
| **pre-commit** | `git commit` | Format + lint (fichiers stages) | < 10 secondes |
| **pre-push** | `git push` | Type-check + tests unitaires | < 60 secondes |
| **CI** | Pull Request | Types + lint + format + tests + build | < 5 minutes |

## Linting & Formatting

- **Prettier** — formatage automatique (`prettier-plugin-tailwindcss` inclus)
- **ESLint** — analyse statique (flat config, `eslint-config-next/core-web-vitals`)
- **lint-staged** — lint uniquement les fichiers stages (via Husky pre-commit)
- Regles cles : `no-explicit-any: error`, `no-unused-vars: error`, `no-img-element: error`

> Alternative : **Biome** (10-25x plus rapide) si pas besoin de plugins ESLint specifiques.

## Hooks Git (Husky)

| Hook | Action |
|---|---|
| `pre-commit` | `npx lint-staged` (Prettier + ESLint sur fichiers stages) |
| `pre-push` | `npm run typecheck && npm run test` |
| `commit-msg` (optionnel) | `npx commitlint --edit $1` (conventional commits) |

> `tsc --noEmit` n'est PAS dans lint-staged (besoin du projet entier) → pre-push.

## Scripts package.json recommandes

```json
"lint": "eslint .",
"format": "prettier --check .",
"typecheck": "tsc --noEmit",
"test": "vitest run",
"validate": "npm run typecheck && npm run lint && npm run test && npm run build"
```

## CI — GitHub Actions (obligatoire avant merge)

```
1. tsc --noEmit       → zero erreur TypeScript
2. eslint .           → zero warning
3. prettier --check . → zero erreur de formatage
4. vitest run         → zero test en echec
5. next build         → build reussie
```

**La CI est bloquante.** Pas de merge si un check echoue. Pas de `--no-verify`.

## VSCode — Settings partagees

Les fichiers `.vscode/settings.json` et `.vscode/extensions.json` sont committes dans le repo. Chaque developpeur a le meme environnement : format on save, ESLint auto-fix, Tailwind IntelliSense.

## Tests

- **Vitest** — framework de test privilegie
- Approche **TDD** (Test Driven Development)
- **Pas de mocks** sauf necessite absolue — privilegier les vrais comportements
- **MSW** (Mock Service Worker) pour mocker au niveau reseau quand necessaire
- Voir [tests-strategie.md](tests-strategie.md) pour la strategie complete

## Documentation & Versions

- Toujours utiliser la **documentation a jour** (via Context7 ou MCP)
- Ne pas se fier aux connaissances statiques pour les APIs/librairies — verifier la version courante

> Ref: Constitution V5 §23
