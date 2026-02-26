# Performance

## Budget

| Metrique | Cible |
|---|---|
| JS total par page critique | < 250KB gzip |
| LCP (Largest Contentful Paint) | < 2.5s mobile |
| Requetes au chargement initial | < 5 |

## Memoisation React

| Pattern | Quand |
|---|---|
| `useMemo` | Calculs couteux (filtrage, tri, parsing) |
| `useCallback` | Handlers passes en props a des composants memoises |
| Calcul inline | Calculs triviaux (`fullName = first + last`) — pas besoin de memo |

## Queries conditionnelles

Tout dialog/sheet avec une query doit conditionner le fetch sur l'ouverture :

```typescript
const data = useQuery(open ? fetchItems : null); // pas de fetch si dialog ferme
```

## Images — next/image

- Toute image visible utilise `<Image>` de `next/image` (jamais `<img>`)
- `priority={true}` uniquement sur l'image LCP (hero, above the fold)
- Toujours fournir `width` + `height` (eviter le CLS)

## Dynamic imports

Composants lourds et librairies > 50KB → import dynamique :

```typescript
const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });
const ChartDashboard = dynamic(() => import("./ChartDashboard"), {
  loading: () => <ChartSkeleton />,
});
```

**Candidats** : editeurs riches, viewers PDF, graphiques, highlight.js, marked

## N+1 queries — Prevention

Jamais de fetch dans une boucle `.map()`. Pattern correct :
1. Collecter les IDs (`[...new Set(items.map(i => i.ownerId))]`)
2. Batch fetch en une seule query
3. Construire un Map pour le lookup

## Anti-patterns performance

```
INTERDIT :
- Query dans un dialog ferme sans condition
- Promise.all sans limite sur un tableau de taille inconnue
- Fetch dans une boucle .map() (N+1)
- Event listener scroll sans { passive: true }
- Re-render d'un arbre entier pour un changement local
- Import statique de librairies lourdes → import()
- <img> au lieu de <Image> de next/image
```

> Ref: Constitution V5 §12
