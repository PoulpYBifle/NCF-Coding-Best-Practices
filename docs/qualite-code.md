# Qualité du code

## Linting & Formatting

- **Prettier** — formatage automatique
- **ESLint** — analyse statique
- Les deux pilotés via **Husky** (hooks Git)

## Hooks Git (Husky)

| Hook | Action |
|---|---|
| `pre-commit` | Prettier + ESLint |
| `pre-push` | Vitest (tests) |

## Tests

- **Vitest** — framework de test privilégié
- Approche **TDD** (Test Driven Development)
- **Pas de mocks** sauf nécessité absolue — privilégier les vrais comportements

## Documentation & Versions

- Toujours utiliser la **documentation à jour** (via Context7 ou MCP)
- Ne pas se fier aux connaissances statiques pour les APIs/librairies — vérifier la version courante
