# CSS & Design Tokens

## Zero valeur hardcodee

```tsx
// MAL
<div className="text-emerald-400 bg-[#1a1a2e] p-[13px]">

// BIEN
<div className="text-primary bg-card p-3">
```

**Toute couleur doit venir des tokens CSS definis dans `globals.css`.**

## Layout flex — Regle d'or

Dans un layout flex/grid imbrique, utiliser `flex-1 min-h-0` (jamais `h-full`) :

```tsx
// MAL — Casse l'overflow dans les contextes imbriques
<div className="h-full overflow-y-auto">

// BIEN — Propage correctement l'overflow
<div className="flex-1 min-h-0 overflow-y-auto">
```

## Responsive — Mobile-first

```tsx
// Cacher sur mobile, montrer sur desktop
<div className="hidden md:flex">

// Padding adaptatif
<div className="p-3 md:p-4">
```

Les breakpoints Tailwind sont mobile-first : les classes sans prefixe s'appliquent a toutes les tailles, les prefixes (`md:`, `lg:`) s'appliquent a partir de cette taille.

> Ref: Constitution V5 §18
