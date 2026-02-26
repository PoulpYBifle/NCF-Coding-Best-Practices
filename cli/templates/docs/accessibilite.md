# Accessibilite (a11y)

L'accessibilite n'est pas optionnelle. Ces regles s'appliquent a chaque composant, pas en fin de projet.

## 5 regles non-negociables

| Regle | Implementation |
|---|---|
| **Navigation clavier** | Tout element interactif atteignable au clavier (Tab, Enter, Escape) |
| **Labels explicites** | Tout `<input>` a un `<label>` associe ou `aria-label`. Zero input orphelin. |
| **Texte alternatif** | Toute `<img>` a un `alt` descriptif ou `alt=""` si decorative |
| **Contraste suffisant** | WCAG AA : ratio 4.5:1 (texte), 3:1 (grands textes) |
| **Focus visible** | `:focus-visible` sur tous les interactifs. Jamais `outline: none` sans alternative |

## Regles supplementaires

- `<button type="button">` explicite (evite submit accidentel)
- `<dialog>` avec `aria-labelledby` + `aria-modal="true"`
- `aria-live="polite"` pour notifications dynamiques
- Skip link en premier element focusable de la page
- Jamais `<div onClick>` → utiliser `<button>` ou `<a>` semantique

## Formulaires accessibles

- `<label htmlFor="id">` associe a chaque input
- `aria-invalid` sur les champs en erreur
- `aria-describedby` pointant vers le message d'erreur
- Hint text avec `id` reference par `aria-describedby`

## Toasts et notifications

Verifier que la librairie de toasts utilise `aria-live` (Sonner le fait nativement).

## Testing automatise

Integrer `axe-core` dans les tests d'integration :

```typescript
it("n'a pas de violations a11y", async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## CSS d'accessibilite

```css
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

> Ref: Constitution V5 §13
