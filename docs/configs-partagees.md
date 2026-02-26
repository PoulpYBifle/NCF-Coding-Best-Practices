# Configs qualite — Strategie

## Principe : le template copie tout

`create-ncf-app` installe les **packages officiels** (eslint, prettier, husky, vitest...) et copie des **fichiers de config pre-remplis** avec les regles NCF. Zero package custom a creer ou maintenir.

Le developpeur lance `create-ncf-app`, tout est deja configure. Il code.

## Ce que le template installe et copie

### Packages installes (officiels, existants)

```json
// package.json — devDependencies
{
  "eslint": "^9",
  "eslint-config-next": "^16",
  "eslint-config-prettier": "^10",
  "prettier": "^3",
  "prettier-plugin-tailwindcss": "^0.6",
  "husky": "^9",
  "lint-staged": "^15",
  "@commitlint/cli": "^19",
  "@commitlint/config-conventional": "^19",
  "vitest": "^3",
  "@testing-library/react": "^16",
  "typescript": "^5.7"
}
```

Aucun package `@ncf/` — que des packages open source standards.

### Fichiers de config copies par le template

| Fichier | Contenu |
|---|---|
| `eslint.config.mjs` | Regles NCF (no-any, exhaustive-deps, etc.) |
| `.prettierrc` | Semi, singleQuote false, printWidth 100, plugin Tailwind |
| `tsconfig.json` | Strict, bundler resolution, paths `@/*` |
| `commitlint.config.mjs` | Conventional commits + scope obligatoire |
| `.husky/pre-commit` | `lint-staged` (Prettier + ESLint) |
| `.husky/pre-push` | `tsc --noEmit` + `vitest run` |
| `lint-staged.config.mjs` | Format + lint sur fichiers stages |
| `vitest.config.ts` | Setup, coverage, exclude patterns |
| `tailwind.config.ts` | Content paths, tokens custom |
| `next.config.ts` | Config Next.js de base |
| `.vscode/settings.json` | Format on save, ESLint auto-fix |

Ces fichiers contiennent deja toutes les regles NCF. Le dev n'a rien a configurer.

## Contenu exact des configs NCF

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "printWidth": 100,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `eslint.config.mjs`

```javascript
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import { globalIgnores } from "eslint/config";

export default [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "error",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "coverage/**"]),
  // Regles specifiques au projet ici (si besoin)
];
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `commitlint.config.mjs`

```javascript
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "refactor", "chore", "test", "docs", "style", "perf"]],
    "scope-empty": [1, "never"],
    "subject-max-length": [2, "always", 72],
  },
};
```

### `lint-staged.config.mjs`

```javascript
export default {
  "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css}": ["prettier --write"],
};
```

## Modifier une regle NCF

Tu veux changer une regle (ex: `printWidth: 120` au lieu de `100`) :

1. Modifier le fichier dans `templates/_base/.prettierrc`
2. Les **nouveaux projets** auront la nouvelle regle automatiquement
3. Les **projets existants** : modifier manuellement le `.prettierrc` (une ligne)

C'est simple et explicite. Pas de magie, pas de dependance custom.

## Quand envisager des packages custom (scaling)

> **Tu n'en as PAS besoin maintenant.** Cette section existe pour reference future.

Si un jour tu geres **10+ projets en production simultanement** et que modifier une regle dans chaque projet devient penible, tu peux extraire les configs dans des packages npm (`@ncf/eslint-config`, etc.). Chaque projet les installe, et un `npm update` propage le changement partout.

Mais c'est un probleme de scaling. Pour 1-5 projets, le template suffit largement.
