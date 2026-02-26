# Creation de Skills Claude

## Structure d'un skill

```
mon-skill/
├── SKILL.md              # OBLIGATOIRE — fichier principal
├── scripts/              # Optionnel — code executable
├── references/           # Optionnel — docs chargees a la demande
└── assets/               # Optionnel — templates, fonts
```

## Regles de nommage

| Element | Regle | Exemple |
|---|---|---|
| `SKILL.md` | Exactement ce nom (case-sensitive) | `SKILL.md` |
| Dossier du skill | kebab-case | `notion-project-setup` |
| `name` dans le frontmatter | kebab-case, doit matcher le dossier | `name: mon-skill` |

**Pas de `README.md`** dans le dossier du skill (reserve au repo GitHub).

## Frontmatter YAML — La partie critique

```yaml
---
name: mon-skill-name
description: |
  [Ce que ca fait]. [Quand l'utiliser avec phrases-trigger specifiques].
  Utiliser ce skill des que l'utilisateur mentionne [keywords].
  Ne PAS utiliser pour [exclusions].
license: MIT
metadata:
  author: NCF
  version: 1.0.0
  category: automation
---
```

**Anatomie d'une bonne description** : `[Ce que ca fait]` + `[Quand l'utiliser]` + `[Capacites cles]`

**Astuce** : Claude a tendance a sous-declencher. Rendre la description legerement "pushy" avec des phrases-trigger explicites.

## Progressive Disclosure — 3 niveaux

| Niveau | Contenu | Chargement | Taille cible |
|---|---|---|---|
| **1** — Frontmatter | name + description | Toujours dans le system prompt | ~100 mots |
| **2** — Corps SKILL.md | Instructions completes | Quand Claude juge pertinent | < 500 lignes |
| **3** — Fichiers lies | Scripts, references | A la demande | Illimite |

## 5 patterns de skills

| Pattern | Quand l'utiliser |
|---|---|
| **Orchestration sequentielle** | Processus multi-etapes dans un ordre specifique |
| **Coordination multi-MCP** | Workflows traversant plusieurs services |
| **Raffinement iteratif** | Qualite qui s'ameliore avec l'iteration |
| **Selection context-aware** | Meme objectif, outils differents selon contexte |
| **Intelligence domain-specific** | Connaissances metier au-dela de l'acces outils |

## Triggering — Reglage fin

**Sous-declenchement** : Ajouter details/nuance a la description, inclure mots-cles techniques, phrases-trigger naturelles.

**Sur-declenchement** : Ajouter triggers negatifs ("Ne PAS utiliser pour..."), etre plus specifique, clarifier le perimetre.

**Debug** : Demander a Claude "Quand utiliserais-tu le skill [nom] ?" — il citera la description.

## Checklist avant upload

- [ ] Dossier kebab-case, `SKILL.md` exact
- [ ] Frontmatter YAML avec `name` + `description`
- [ ] Description inclut QUOI et QUAND (avec triggers)
- [ ] Pas de tags XML (`< >`) dans le frontmatter
- [ ] Instructions claires et actionnables
- [ ] Error handling inclus
- [ ] Teste sur taches evidentes et paraphrasees
- [ ] Verifie qu'il ne declenche pas sur sujets non lies
- [ ] SKILL.md < 500 lignes

## Securite

- Jamais de tags XML dans le frontmatter (injection possible)
- Pas de noms avec "claude" ou "anthropic" (reserves)
- Jamais de malware, code d'exploit ou contenu compromettant

> Ref: skills/skill-max.md
