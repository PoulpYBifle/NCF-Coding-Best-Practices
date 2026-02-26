# Git & GitHub — Workflow

## Conventional Commits (avec scope)

```
feat(auth): ajouter login OAuth Google
fix(dashboard): corriger le compteur de projets
refactor(api): extraire helper de validation
chore(deps): mettre a jour next.js vers 15.2
test(users): ajouter tests unitaires createUser
```

**Un commit = un changement atomique.** Pas de commits "WIP" ou "fix stuff".

## Regles de commit

- **Committer apres chaque feature ou modification significative**
- Les commits sont lies aux hooks Husky — le pre-commit valide avant d'enregistrer
- Commitlint (optionnel) enforce le format conventional commits

## Branches

```
main              ← production
feat/nom-feature  ← feature en cours
fix/nom-bug       ← correction de bug
refactor/nom      ← refactoring structurel
```

## Pull Requests

- **Grosse feature ou modification majeure** → nouvelle branche → PR
- **Petits changements** peuvent aller directement sur `main`
- **Max 400 lignes de diff par PR.** Au-dela, decouper en PRs plus petites. Les PRs massives ne sont pas reviewables.
- La CI doit passer avant merge (voir [qualite-code.md](qualite-code.md))

## CI obligatoire

Avant tout merge sur main :
1. `tsc --noEmit` — zero erreur TypeScript
2. `eslint .` — zero warning
3. `prettier --check .` — zero erreur de formatage
4. `vitest run` — zero test en echec
5. `next build` — build reussie

## Outils complementaires

- **Claude Actions** / **GitHub Copilot** — a explorer pour l'automatisation CI/CD

> Ref: Constitution V5 §20
