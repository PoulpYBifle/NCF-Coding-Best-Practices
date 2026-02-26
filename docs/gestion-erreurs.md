# Gestion d'erreurs

## Backend — Erreur structuree obligatoire

Toute erreur backend doit utiliser `AppError({ code, message })`, jamais `new Error("...")`.

Voir la taxonomie des codes dans [api-backend-patterns.md](api-backend-patterns.md).

## Frontend — Pattern try/catch + toast

Toute mutation CRUD suit ce template :

```
1. Guard (validation locale)     → return early
2. Set loading state             → setLoading(true)
3. try { mutation + toast.success + close/reset }
4. catch { toast.error(extractErrorMessage(e)) }
5. finally { setLoading(false) }
```

## Mapping erreurs vers champs de formulaire

Quand l'API retourne une erreur de validation par champ, la mapper vers `form.setError()` (RHF) au lieu d'un toast generique. Ajouter `aria-invalid` + `aria-describedby` sur les champs en erreur.

## Error Boundaries (Next.js)

| Fichier | Role | Obligatoire ? |
|---|---|---|
| `loading.tsx` | Fallback pendant le chargement | Oui si fetch async |
| `error.tsx` | Fallback en cas d'erreur (avec bouton retry) | Oui si fetch async |

## Fetch externe — Toujours verifier `res.ok`

```typescript
const res = await fetch(url, { method: "POST", body });
if (!res.ok) throw new Error(`Requete echouee (${res.status})`);
const data = await res.json();
```

## Etats de chargement

| Situation | Pattern |
|---|---|
| Chargement initial de page | `loading.tsx` (Suspense route-level) |
| Section independante | `<Suspense fallback={<Skeleton />}>` |
| Mutation en cours | `setSaving(true)` + bouton disabled |
| Transition entre vues | `useTransition` + opacity |
| Pagination | Skeleton inline ou spinner en bas de liste |

**Anti-pattern** : Spinner plein ecran pour une operation locale. Utiliser un indicateur local.

**Chaque type de contenu a son propre skeleton.** Nommage : `[Entity]CardSkeleton.tsx`

> Ref: Constitution V5 §10
