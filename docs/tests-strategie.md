# Tests — Strategie

## Philosophie

Un code sans tests n'est pas clean — c'est un code qui fonctionne par accident. **Tester le comportement, pas l'implementation.**

## Pyramide des tests

| Type | Outil | Quand |
|---|---|---|
| Unitaire | Vitest | Helpers, utils, fonctions pures, validations |
| Integration | Vitest + Testing Library | Composants avec logique, formulaires, interactions |
| Contract | Vitest + Zod schemas | Contrats API (schemas partages) |
| E2E | Playwright | Parcours critiques (auth, CRUD principal, paiement) |

> Les tests d'integration offrent le meilleur ratio confiance/cout (Kent C. Dodds "Testing Trophy").

## Priorisation

| Priorite | Quoi tester |
|---|---|
| **P0 — Critique** | Mutations (create, update, delete), auth guards |
| **P1 — Elevee** | Helpers partages, paiement/billing, contrats API |
| **P2 — Moyenne** | Queries avec filtres/pagination, formulaires |
| **P3 — Faible** | Composants d'affichage pur |

## Mocking — Principes

1. **Mocker les frontieres** (appels DB, API externes), pas les internals
2. Un mock ne reimplemente jamais la logique metier — il retourne des donnees fixes
3. Utiliser **MSW** (Mock Service Worker) pour mocker au niveau reseau quand possible

## Test data factories

Utiliser des factories pour generer des donnees de test coherentes. Pas de copier-coller d'objets entre tests.

```typescript
// tests/helpers/factories.ts
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return { id: `proj_${++counter}`, name: `Projet ${counter}`, ...overrides };
}
```

## Seuils de couverture (recommandation)

| Metrique | Minimum | Cible |
|---|---|---|
| Lignes | 60% | 80% |
| Branches | 50% | 70% |
| Fonctions | 60% | 80% |

Les seuils sont un signal, pas un objectif. 100% avec tests fragiles est pire que 70% avec tests solides.

## Regle du test de regression

**Pas de fix sans test :**
1. Ecrire le test qui reproduit le bug (il doit echouer)
2. Fixer le code (le test passe)
3. Committer test + fix ensemble

## Structure des fichiers

- Tests a cote du code : `components/projects/__tests__/ProjectCard.test.tsx`
- Contract tests : `lib/schemas/__tests__/project.contract.test.ts`
- E2E + helpers partages : `tests/` a la racine

> Ref: Constitution V5 §21
