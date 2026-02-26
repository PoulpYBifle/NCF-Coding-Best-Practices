# NCF-AIDD — Workflow CLI interactif

> `npx create-ncf-aidd` / `bunx create-ncf-aidd`

---

## Flow interactif

### 1. Type de projet
- Projet perso
- Projet client
> Impact : le mode "client" pourrait ajouter des règles plus strictes (observabilité, logs structurés, PR checklist renforcée)

### 2. Stack frontend
- Next.js (App Router)
- Vite (React)
- Astro (landing / SEO)
> Fichiers copiés selon le choix :
> - Next.js → `react-nextjs-patterns.md`, `state-management.md`
> - Tous → `typescript-conventions.md`, `css-design-tokens.md`

### 3. Backend
- Supabase
- Convex
- SQLite
- Aucun / Autre
> Fichiers copiés :
> - Supabase → `securite.md` (RLS, CSRF, sessions), `base-de-donnees.md`
> - Tous (sauf Aucun) → `api-backend-patterns.md`, `contrats-api.md`, `gestion-erreurs.md`

### 4. Outils AI (multi-select)
- [ ] Claude Code
- [ ] Cursor
- [ ] GitHub Copilot
- [ ] Codex (OpenAI)
- [ ] Kilo Code
- [ ] Antigravity
- [ ] OpenCode
> Fichiers copiés par outil :
> - Claude Code → `CLAUDE.md` + `skills/ncf-frontend/` + `skills/ncf-backend/` + `skills/ncf-review/`
> - Cursor → `.cursor/rules/project.mdc`
> - Copilot → `.github/copilot-instructions.md`
> - Codex → `AGENTS.md`
> - Kilo Code → `.kilocode/rules.md`
> - Antigravity → (à créer)
> - OpenCode → (à créer)

### 5. Commandes d'analyse (multi-select)
- [ ] Toutes (recommandé)
- [ ] DRY
- [ ] KISS
- [ ] SOLID
- [ ] YAGNI
- [ ] Security Audit
- [ ] Rapport complet
- [ ] Deep Dive (debug macro)
- [ ] Validate (checklist finale)
> Fichiers copiés dans `commands/` selon sélection

### 6. Modules docs (multi-select)
- [ ] Tous (recommandé)
- [ ] Principes fondamentaux (`principes.md`)
- [ ] Qualité code & linting (`qualite-code.md`)
- [ ] Stratégie de tests (`tests-strategie.md`)
- [ ] Git workflow (`git-workflow.md`)
- [ ] Performance (`performance.md`)
- [ ] Accessibilité (`accessibilite.md`)
- [ ] Observabilité & logs (`observabilite.md`)
- [ ] Anti-patterns checklist (`anti-patterns-checklist.md`)
> Toujours inclus : `principes.md` (socle minimum)

### 7. Constitution Clean Code V5
- Oui, inclure (recommandé — 110 KB, référence exhaustive)
- Non, version légère seulement (les docs modulaires suffisent)
> Si oui → copie `docs/CLEAN-CODE-CONSTITUTION-V5.md`

### 8. Guide création de Skills
- Oui (si le user veut créer ses propres skills Claude)
- Non
> Si oui → copie `skills/skill-max.md` + `docs/creation-skills.md`

---

## Mapping fichiers → destination dans le projet cible

```
projet-cible/
├── CLAUDE.md                          # si Claude Code sélectionné
├── AGENTS.md                          # si Codex sélectionné
├── .cursor/rules/project.mdc         # si Cursor sélectionné
├── .github/copilot-instructions.md   # si Copilot sélectionné
├── .kilocode/rules.md                # si Kilo Code sélectionné
├── .ncf/                              # dossier NCF (tout le reste)
│   ├── docs/                          # docs sélectionnées
│   │   ├── principes.md
│   │   ├── typescript-conventions.md
│   │   ├── react-nextjs-patterns.md   # si Next.js
│   │   ├── securite.md                # si Supabase
│   │   ├── base-de-donnees.md         # si backend
│   │   ├── ...
│   │   └── CLEAN-CODE-CONSTITUTION-V5.md  # si choisi
│   ├── commands/                      # commandes sélectionnées
│   │   ├── dry.md
│   │   ├── kiss.md
│   │   └── ...
│   └── skills/                        # si Claude Code
│       ├── ncf-frontend/SKILL.md
│       ├── ncf-backend/SKILL.md
│       └── ncf-review/SKILL.md
└── ...
```

---

## Logique de copie

1. Les fichiers **AI tools** vont à la racine (chaque outil a son emplacement imposé)
2. Tout le reste va dans `.ncf/` pour ne pas polluer la racine du projet
3. Le contenu des fichiers CLAUDE.md/AGENTS.md est **adapté dynamiquement** :
   - Les skills référencées correspondent à celles installées
   - Les règles backend sont incluses seulement si un backend est choisi
   - La stack mentionnée correspond au choix réel (Next.js vs Vite vs Astro)

---

## Post-installation

```
✓ 23 fichiers copiés dans votre projet

Prochaines étapes :
  1. Lisez .ncf/docs/principes.md pour le socle de règles
  2. Vos outils AI sont configurés : Claude Code, Cursor
  3. Commandes disponibles dans .ncf/commands/

Astuce : ajoutez .ncf/ à votre documentation interne
```

---

## Options CLI (flags)

```bash
# Installation interactive (défaut)
npx create-ncf-aidd

# Installation avec preset
npx create-ncf-aidd --preset fullstack-next

# Tout inclure sans questions
npx create-ncf-aidd --all

# Cibler un dossier
npx create-ncf-aidd ./mon-projet

# Forcer l'écrasement
npx create-ncf-aidd --force

# Mode CI (non-interactif, utilise les défauts)
npx create-ncf-aidd --yes
```

---

## Presets possibles (raccourcis)

| Preset | Stack | Backend | AI Tools | Docs |
|--------|-------|---------|----------|------|
| `fullstack-next` | Next.js | Supabase | Claude + Cursor | Toutes |
| `fullstack-vite` | Vite | Supabase | Claude + Cursor | Toutes |
| `landing` | Astro | Aucun | Claude | Essentielles |
| `minimal` | — | — | Claude | Principes seuls |
| `all` | Next.js | Supabase | Tous | Toutes |
