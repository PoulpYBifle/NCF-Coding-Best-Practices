# 🛠️ La Bible des Skills Claude — Référence Complète

> Document de référence portable. À embarquer dans chaque projet nécessitant la création, l'édition ou le déploiement de skills pour Claude.

---

## Table des Matières

1. [Qu'est-ce qu'un Skill](#1-quest-ce-quun-skill)
2. [Architecture & Structure](#2-architecture--structure)
3. [Le Frontmatter YAML — Le Nerf de la Guerre](#3-le-frontmatter-yaml--le-nerf-de-la-guerre)
4. [Rédiger le Corps du SKILL.md](#4-rédiger-le-corps-du-skillmd)
5. [Progressive Disclosure — Les 3 Niveaux](#5-progressive-disclosure--les-3-niveaux)
6. [Les 5 Patterns de Skills](#6-les-5-patterns-de-skills)
7. [Catégories de Use Cases](#7-catégories-de-use-cases)
8. [Testing & Itération](#8-testing--itération)
9. [Triggering — Réglage Fin](#9-triggering--réglage-fin)
10. [Troubleshooting — Diagnostic Express](#10-troubleshooting--diagnostic-express)
11. [Distribution & Déploiement](#11-distribution--déploiement)
12. [Checklists & Templates](#12-checklists--templates)
13. [Règles de Sécurité](#13-règles-de-sécurité)

---

## 1. Qu'est-ce qu'un Skill

Un skill est un **dossier** contenant des instructions qui enseignent à Claude comment gérer des tâches ou workflows spécifiques. Au lieu de réexpliquer ses préférences à chaque conversation, on enseigne une fois, Claude applique à chaque fois.

**Caractéristiques fondamentales :**

- **Composabilité** — Claude peut charger plusieurs skills simultanément. Un skill ne doit jamais supposer qu'il est le seul actif.
- **Portabilité** — Fonctionne de manière identique sur Claude.ai, Claude Code et l'API. Créé une fois, utilisable partout.
- **Progressive Disclosure** — Système à 3 niveaux qui minimise la consommation de tokens tout en maintenant l'expertise.

---

## 2. Architecture & Structure

### Arborescence d'un skill

```
mon-skill/
├── SKILL.md              # OBLIGATOIRE — fichier principal
├── scripts/              # Optionnel — code exécutable
│   ├── process_data.py
│   └── validate.sh
├── references/           # Optionnel — documentation chargée à la demande
│   ├── api-guide.md
│   └── examples/
└── assets/               # Optionnel — templates, fonts, icônes
    └── report-template.md
```

### Règles critiques de nommage

| Élément | Règle | Exemple ✅ | Contre-exemple ❌ |
|---------|-------|-----------|-------------------|
| `SKILL.md` | Exactement ce nom (case-sensitive) | `SKILL.md` | `skill.md`, `SKILL.MD` |
| Dossier du skill | kebab-case uniquement | `notion-project-setup` | `Notion Project Setup`, `notion_project_setup` |
| Nom dans le frontmatter | kebab-case, doit matcher le dossier | `name: mon-skill` | `name: Mon Skill` |

### Fichiers interdits

- **Pas de `README.md`** dans le dossier du skill. Toute la documentation va dans `SKILL.md` ou `references/`.
- Le `README.md` est réservé au repo GitHub pour les humains qui visitent le dépôt.

---

## 3. Le Frontmatter YAML — Le Nerf de la Guerre

Le frontmatter est **la partie la plus critique** du skill. C'est sur cette base que Claude décide de charger ou non le skill. Tout se joue ici.

### Format minimal obligatoire

```yaml
---
name: mon-skill-name
description: Ce qu'il fait. Utiliser quand l'utilisateur demande [phrases spécifiques].
---
```

### Tous les champs disponibles

```yaml
---
name: mon-skill                          # REQUIS — kebab-case
description: |                           # REQUIS — max 1024 caractères, pas de < >
  Ce que fait le skill et quand l'utiliser.
  Inclure des phrases-trigger spécifiques.
license: MIT                             # Optionnel — MIT, Apache-2.0, etc.
compatibility: |                         # Optionnel — max 500 caractères
  Nécessite Node.js, accès réseau, etc.
metadata:                                # Optionnel — clés-valeurs libres
  author: LLMPRO
  version: 1.0.0
  mcp-server: nom-du-serveur
  category: productivity
  tags: [automation, no-code]
---
```

### Anatomie d'une bonne description

**Structure :** `[Ce que ça fait]` + `[Quand l'utiliser]` + `[Capacités clés]`

```yaml
# ✅ BON — spécifique, actionnable, avec triggers
description: Analyse les fichiers Figma et génère la documentation
  de handoff développeur. Utiliser quand l'utilisateur upload des
  fichiers .fig, demande "design specs", "documentation composants",
  ou "design-to-code handoff".

# ✅ BON — phrases-trigger incluses
description: Gère les workflows Linear incluant sprint planning,
  création de tâches et suivi de statut. Utiliser quand l'utilisateur
  mentionne "sprint", "tâches Linear", "planification projet".

# ❌ MAUVAIS — trop vague
description: Aide avec les projets.

# ❌ MAUVAIS — pas de triggers
description: Crée des systèmes de documentation multi-pages sophistiqués.

# ❌ MAUVAIS — trop technique, pas de triggers utilisateur
description: Implémente le modèle d'entité Project avec relations hiérarchiques.
```

### Astuce anti-sous-déclenchement

Claude a tendance à **sous-déclencher** les skills. Pour contrer ça, rendre la description légèrement "pushy" :

```yaml
# Au lieu de :
description: Comment créer un dashboard pour afficher des données internes.

# Préférer :
description: Comment créer un dashboard pour afficher des données internes.
  Utiliser ce skill dès que l'utilisateur mentionne dashboards,
  visualisation de données, métriques, ou veut afficher n'importe
  quel type de données, même s'il ne demande pas explicitement un "dashboard".
```

---

## 4. Rédiger le Corps du SKILL.md

### Template de base recommandé

```markdown
---
name: mon-skill
description: [description avec triggers]
---

# Nom du Skill

## Instructions

### Étape 1 : [Première Étape Majeure]
Explication claire de ce qui se passe.

Exemple :
\`\`\`bash
python scripts/fetch_data.py --project-id PROJECT_ID
\`\`\`
Résultat attendu : [décrire à quoi ressemble le succès]

### Étape 2 : [Étape Suivante]
[...]

## Exemples

### Exemple 1 : [scénario courant]
L'utilisateur dit : "Configure un nouveau workspace"
Actions :
1. Récupérer les données existantes via MCP
2. Créer le nouveau workspace avec les paramètres fournis
Résultat : Workspace créé avec lien de confirmation

## Troubleshooting

### Erreur : [Message d'erreur courant]
Cause : [Pourquoi ça arrive]
Solution : [Comment résoudre]
```

### Principes de rédaction des instructions

**Être spécifique et actionnable :**

```markdown
# ✅ BON
Exécuter `python scripts/validate.py --input {filename}` pour vérifier le format.
Si la validation échoue, les problèmes courants incluent :
- Champs requis manquants (les ajouter au CSV)
- Formats de date invalides (utiliser YYYY-MM-DD)

# ❌ MAUVAIS
Valider les données avant de continuer.
```

**Inclure le error handling :**

```markdown
## Problèmes Courants

### Connexion MCP échouée
Si vous voyez "Connection refused" :
1. Vérifier que le serveur MCP est connecté : Settings > Extensions
2. Confirmer que la clé API est valide
3. Tenter la reconnexion : Settings > Extensions > [Service] > Reconnect
```

**Référencer les ressources clairement :**

```markdown
Avant d'écrire des requêtes, consulter `references/api-patterns.md` pour :
- Guidance sur le rate limiting
- Patterns de pagination
- Codes d'erreur et leur gestion
```

### Limites de taille

- **SKILL.md** : Garder sous **500 lignes** (idéal) / **5000 mots** (maximum)
- Si on approche la limite : ajouter une couche de hiérarchie avec des pointeurs clairs vers les fichiers de référence
- **Fichiers de référence volumineux** (>300 lignes) : inclure une table des matières

---

## 5. Progressive Disclosure — Les 3 Niveaux

| Niveau | Contenu | Chargement | Taille cible |
|--------|---------|------------|-------------|
| **Niveau 1** — Frontmatter YAML | `name` + `description` | **Toujours** dans le system prompt | ~100 mots |
| **Niveau 2** — Corps du SKILL.md | Instructions complètes | Quand Claude juge le skill pertinent | <500 lignes |
| **Niveau 3** — Fichiers liés | Scripts, références, assets | À la demande, quand nécessaire | Illimité |

**Principe clé :** Les scripts peuvent s'exécuter sans être chargés en contexte. Seules les références textuelles consomment des tokens.

### Organisation par domaine

Quand un skill supporte plusieurs variantes ou frameworks :

```
cloud-deploy/
├── SKILL.md          # Workflow + logique de sélection
└── references/
    ├── aws.md        # Claude ne lit que le fichier pertinent
    ├── gcp.md
    └── azure.md
```

---

## 6. Les 5 Patterns de Skills

### Pattern 1 : Orchestration Séquentielle de Workflow

**Quand l'utiliser :** Processus multi-étapes dans un ordre spécifique.

```markdown
# Workflow : Onboard Nouveau Client

## Étape 1 : Créer le compte
Appeler l'outil MCP : `create_customer`
Paramètres : name, email, company

## Étape 2 : Configurer le paiement
Appeler l'outil MCP : `setup_payment_method`
Attendre : vérification du moyen de paiement

## Étape 3 : Créer l'abonnement
Appeler l'outil MCP : `create_subscription`
Paramètres : plan_id, customer_id (de l'Étape 1)

## Étape 4 : Envoyer l'email de bienvenue
Appeler l'outil MCP : `send_email`
Template : welcome_email_template
```

**Techniques clés :** Ordre explicite des étapes, dépendances entre étapes, validation à chaque stade, instructions de rollback en cas d'échec.

---

### Pattern 2 : Coordination Multi-MCP

**Quand l'utiliser :** Workflows qui traversent plusieurs services.

```markdown
# Phase 1 : Export Design (Figma MCP)
1. Exporter les assets depuis Figma
2. Générer les spécifications de design

# Phase 2 : Stockage (Drive MCP)
1. Créer le dossier projet dans Drive
2. Uploader tous les assets

# Phase 3 : Création de tâches (Linear MCP)
1. Créer les tâches de développement
2. Attacher les liens des assets

# Phase 4 : Notification (Slack MCP)
1. Poster le résumé de handoff dans #engineering
```

**Techniques clés :** Séparation claire des phases, passage de données entre MCPs, validation avant passage à la phase suivante, error handling centralisé.

---

### Pattern 3 : Raffinement Itératif

**Quand l'utiliser :** La qualité de l'output s'améliore avec l'itération.

```markdown
# Draft Initial
1. Récupérer les données via MCP
2. Générer le premier draft
3. Sauvegarder en fichier temporaire

# Contrôle Qualité
1. Exécuter le script de validation : `scripts/check_report.py`
2. Identifier les problèmes

# Boucle de Raffinement
1. Corriger chaque problème identifié
2. Regénérer les sections affectées
3. Re-valider
4. Répéter jusqu'au seuil de qualité

# Finalisation
1. Appliquer le formatage final
2. Sauvegarder la version finale
```

**Techniques clés :** Critères de qualité explicites, scripts de validation, savoir quand arrêter d'itérer.

---

### Pattern 4 : Sélection d'Outils Context-Aware

**Quand l'utiliser :** Même objectif, outils différents selon le contexte.

```markdown
# Arbre de Décision
1. Vérifier le type et la taille du fichier
2. Déterminer le meilleur emplacement :
   - Gros fichiers (>10MB) : Cloud storage MCP
   - Docs collaboratifs : Notion/Docs MCP
   - Fichiers code : GitHub MCP
   - Fichiers temporaires : Stockage local

# Exécuter le stockage selon la décision
# Expliquer le choix à l'utilisateur
```

**Techniques clés :** Critères de décision clairs, options de fallback, transparence sur les choix.

---

### Pattern 5 : Intelligence Domain-Specific

**Quand l'utiliser :** Le skill apporte des connaissances métier au-delà de l'accès aux outils.

```markdown
# Avant le traitement (Vérification Conformité)
1. Récupérer les détails via MCP
2. Appliquer les règles métier :
   - Vérifier les listes de sanctions
   - Vérifier les autorisations juridictionnelles
   - Évaluer le niveau de risque
3. Documenter la décision

# Traitement
SI conformité validée :
  - Appeler l'outil MCP de traitement
  - Appliquer les vérifications appropriées
SINON :
  - Flaguer pour revue manuelle

# Piste d'Audit
- Logger toutes les vérifications
- Enregistrer les décisions
```

**Techniques clés :** Expertise métier intégrée dans la logique, conformité avant action, documentation exhaustive.

---

## 7. Catégories de Use Cases

### Catégorie 1 : Création de Documents & Assets

Créer des outputs consistants et de haute qualité (documents, présentations, apps, designs, code).

**Techniques :** Style guides intégrés, templates, checklists qualité, pas de dépendances externes.

### Catégorie 2 : Automatisation de Workflows

Processus multi-étapes bénéficiant d'une méthodologie consistante, incluant la coordination entre plusieurs serveurs MCP.

**Techniques :** Workflow étape par étape avec gates de validation, templates, boucles de raffinement itératif.

### Catégorie 3 : Enhancement MCP

Guidance workflow pour enrichir l'accès aux outils fourni par un serveur MCP.

**Techniques :** Coordination de multiples appels MCP en séquence, expertise métier intégrée, error handling pour les problèmes MCP courants.

---

## 8. Testing & Itération

### 3 niveaux de testing

| Méthode | Description | Quand l'utiliser |
|---------|-------------|-----------------|
| Test manuel dans Claude.ai | Requêtes directes, observation du comportement | Itération rapide, pas de setup |
| Test scripté dans Claude Code | Automatisation des cas de test | Validation reproductible |
| Test programmatique via API Skills | Suites d'évaluation systématiques | Déploiement à grande échelle |

### Stratégie recommandée : Itérer sur une seule tâche d'abord

Itérer sur **une seule tâche difficile** jusqu'à ce que Claude réussisse, puis extraire l'approche gagnante dans le skill. Ensuite seulement, élargir aux cas de test multiples.

### Les 3 types de tests

**1. Tests de Triggering**

```
Doit déclencher :
- "Aide-moi à configurer un workspace ProjectHub"
- "J'ai besoin de créer un projet dans ProjectHub"
- "Initialise un projet ProjectHub pour Q4"

Ne doit PAS déclencher :
- "Quel temps fait-il à Paris ?"
- "Aide-moi à écrire du Python"
- "Crée un tableur"
```

**2. Tests Fonctionnels**

```
Test : Créer un projet avec 5 tâches
Donné : Nom de projet "Q4 Planning", 5 descriptions de tâches
Quand : Le skill exécute le workflow
Alors :
  - Projet créé dans ProjectHub
  - 5 tâches créées avec les bonnes propriétés
  - Toutes les tâches liées au projet
  - 0 erreurs API
```

**3. Comparaison de Performance**

```
Sans skill :
- L'utilisateur fournit les instructions à chaque fois
- 15 messages aller-retour
- 3 appels API échoués nécessitant retry
- 12 000 tokens consommés

Avec skill :
- Exécution automatique du workflow
- 2 questions de clarification seulement
- 0 appels API échoués
- 6 000 tokens consommés
```

### Métriques de succès

**Quantitatif :**
- Le skill se déclenche sur **90%** des requêtes pertinentes
- Workflow complété en **X appels d'outils**
- **0 appels API échoués** par workflow

**Qualitatif :**
- L'utilisateur n'a pas besoin de guider Claude sur les prochaines étapes
- Les workflows se complètent sans correction utilisateur
- Résultats consistants d'une session à l'autre

---

## 9. Triggering — Réglage Fin

### Sous-déclenchement (le skill ne se charge pas)

**Signaux :** Le skill ne se charge jamais automatiquement, les utilisateurs l'activent manuellement.

**Solutions :**
- Ajouter plus de détails et de nuance à la description
- Inclure des mots-clés techniques spécifiques
- Rendre la description plus "pushy"
- Ajouter des phrases-trigger que les utilisateurs diraient réellement

**Astuce de debug :** Demander à Claude : *"Quand utiliserais-tu le skill [nom] ?"* — Claude citera la description. Ajuster en fonction de ce qui manque.

### Sur-déclenchement (le skill se charge pour des requêtes non pertinentes)

**Signaux :** Le skill se charge pour des requêtes hors-sujet, les utilisateurs le désactivent.

**Solutions :**

1. **Ajouter des triggers négatifs :**
```yaml
description: Analyse avancée de données pour fichiers CSV.
  Utiliser pour modélisation statistique, régression, clustering.
  Ne PAS utiliser pour l'exploration simple de données.
```

2. **Être plus spécifique :**
```yaml
# ❌ Trop large
description: Traite des documents

# ✅ Plus spécifique
description: Traite des documents PDF juridiques pour revue de contrats
```

3. **Clarifier le périmètre :**
```yaml
description: Traitement de paiements PayFlow pour e-commerce.
  Utiliser spécifiquement pour les workflows de paiement en ligne,
  pas pour les requêtes financières générales.
```

### Comment fonctionne le triggering en interne

Les skills apparaissent dans la liste `available_skills` de Claude avec leur `name` + `description`. Claude décide de consulter un skill en se basant sur cette description. **Point crucial :** Claude ne consulte les skills que pour des tâches qu'il ne peut pas facilement gérer seul. Les requêtes simples et directes comme "lis ce PDF" ne déclencheront pas un skill même si la description matche, parce que Claude peut les gérer directement avec ses outils de base.

Les requêtes **complexes, multi-étapes ou spécialisées** déclenchent les skills de manière fiable quand la description matche.

---

## 10. Troubleshooting — Diagnostic Express

### Le skill ne s'upload pas

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Could not find SKILL.md" | Fichier mal nommé | Renommer exactement en `SKILL.md` |
| "Invalid frontmatter" | YAML mal formaté | Vérifier les délimiteurs `---`, les quotes fermées |
| "Invalid skill name" | Nom avec espaces/majuscules | Passer en kebab-case |

### Le skill se charge mais Claude ne suit pas les instructions

**Causes courantes et solutions :**

1. **Instructions trop verbeuses** → Garder concis, utiliser listes numérotées, déplacer le détail dans `references/`
2. **Instructions enterrées** → Mettre les instructions critiques en haut, utiliser des headers `## CRITICAL`
3. **Langage ambigu** :
```markdown
# ❌ MAUVAIS
S'assurer de valider les choses correctement

# ✅ BON
CRITIQUE : Avant d'appeler create_project, vérifier :
- Le nom du projet n'est pas vide
- Au moins un membre d'équipe assigné
- La date de début n'est pas dans le passé
```

4. **"Paresse" du modèle** → Ajouter dans le prompt utilisateur (plus efficace que dans SKILL.md) :
```markdown
- Prends ton temps pour faire ça rigoureusement
- La qualité est plus importante que la vitesse
- Ne saute pas les étapes de validation
```

### Problèmes de contexte large

**Symptôme :** Skill lent ou réponses dégradées.

**Solutions :**
- Optimiser la taille du SKILL.md (< 5000 mots)
- Déplacer les docs détaillées dans `references/`
- Évaluer si plus de 20-50 skills sont activés simultanément → activer sélectivement
- Utiliser la progressive disclosure correctement

### Connexion MCP qui échoue

**Checklist :**
1. Vérifier que le serveur MCP est connecté (Settings > Extensions)
2. Vérifier l'authentification (clés API valides, permissions, tokens OAuth)
3. Tester le MCP indépendamment du skill : *"Utilise [Service] MCP pour récupérer mes projets"*
4. Vérifier les noms d'outils (case-sensitive) dans la documentation du serveur MCP

---

## 11. Distribution & Déploiement

### Installation utilisateur individuel

1. Télécharger le dossier du skill
2. Zipper le dossier (si nécessaire)
3. Uploader sur Claude.ai via **Settings > Capabilities > Skills**
4. Ou placer dans le répertoire skills de Claude Code

### Déploiement organisation

- Les admins peuvent déployer des skills à l'échelle du workspace
- Mises à jour automatiques
- Gestion centralisée

### Via l'API

- Endpoint `/v1/skills` pour lister et gérer les skills
- Paramètre `container.skills` dans l'API Messages
- Gestion de versions via la Console Claude
- Compatible avec le Claude Agent SDK
- **Nécessite** le beta Code Execution Tool

### Bonnes pratiques de distribution GitHub

1. **Repo public** avec README clair (le README est pour les humains, PAS dans le dossier du skill)
2. **Documentation** : lier le skill depuis la doc MCP, expliquer la valeur combinée
3. **Guide d'installation** clair avec étapes numérotées
4. **Exemples d'utilisation** avec screenshots

### Positionnement

```markdown
# ✅ Focus sur les résultats
"Le skill ProjectHub permet aux équipes de configurer des
workspaces complets en secondes — incluant pages, bases de données
et templates — au lieu de passer 30 minutes en setup manuel."

# ❌ Focus sur les features techniques
"Le skill ProjectHub est un dossier contenant du YAML frontmatter
et des instructions Markdown qui appelle les outils de notre serveur MCP."
```

---

## 12. Checklists & Templates

### Checklist Pré-Développement

- [ ] 2-3 use cases concrets identifiés
- [ ] Outils identifiés (built-in ou MCP)
- [ ] Structure du dossier planifiée
- [ ] Métriques de succès définies

### Checklist Pendant le Développement

- [ ] Dossier nommé en kebab-case
- [ ] `SKILL.md` existe (orthographe exacte)
- [ ] Frontmatter YAML avec délimiteurs `---`
- [ ] Champ `name` : kebab-case, pas d'espaces, pas de majuscules
- [ ] Champ `description` inclut QUOI et QUAND
- [ ] Pas de tags XML (`< >`) nulle part
- [ ] Instructions claires et actionnables
- [ ] Error handling inclus
- [ ] Exemples fournis
- [ ] Références clairement liées

### Checklist Avant Upload

- [ ] Testé le triggering sur des tâches évidentes
- [ ] Testé le triggering sur des requêtes paraphrasées
- [ ] Vérifié qu'il ne se déclenche pas sur des sujets non liés
- [ ] Tests fonctionnels passent
- [ ] Intégration des outils fonctionne (si applicable)
- [ ] Compressé en fichier `.zip`

### Checklist Post-Upload

- [ ] Testé dans des conversations réelles
- [ ] Surveillé le sous/sur-déclenchement
- [ ] Collecté les retours utilisateurs
- [ ] Itéré sur la description et les instructions
- [ ] Mis à jour la version dans les metadata

### Template Frontmatter Complet

```yaml
---
name: mon-skill-name
description: |
  [Ce que ça fait]. [Quand l'utiliser avec phrases-trigger spécifiques].
  Utiliser ce skill dès que l'utilisateur mentionne [keywords].
  Ne PAS utiliser pour [exclusions].
license: MIT
compatibility: Nécessite Node.js 18+, accès réseau pour API X
metadata:
  author: LLMPRO
  version: 1.0.0
  mcp-server: nom-serveur
  category: automation
  tags: [workflow, no-code, integration]
  documentation: https://docs.example.com
---
```

---

## 13. Règles de Sécurité

### Interdit dans le frontmatter

- **Tags XML** (`< >`) — Le frontmatter apparaît dans le system prompt de Claude. Du contenu malicieux pourrait injecter des instructions.
- **Noms avec "claude" ou "anthropic"** — Préfixes réservés.
- **Exécution de code dans le YAML** — Parsing YAML sécurisé utilisé.

### Principes de sécurité pour le contenu

- Un skill ne doit **jamais contenir** de malware, code d'exploit, ou contenu pouvant compromettre la sécurité système.
- Le contenu d'un skill ne doit pas **surprendre l'utilisateur** dans son intention s'il est décrit.
- Ne pas créer de skills trompeurs ou conçus pour faciliter un accès non autorisé.

### Types de données autorisés dans le YAML

- Types YAML standard : strings, nombres, booléens, listes, objets
- Champs metadata personnalisés
- Descriptions longues (jusqu'à 1024 caractères)

---

## Annexe A : L'Analogie MCP + Skills

**MCP = La cuisine professionnelle** — Accès aux outils, ingrédients et équipements.

**Skills = Les recettes** — Instructions étape par étape pour créer quelque chose de valeur.

| MCP (Connectivité) | Skills (Connaissance) |
|--------------------|-----------------------|
| Connecte Claude au service | Enseigne comment utiliser le service efficacement |
| Fournit l'accès aux données et l'invocation d'outils | Capture les workflows et bonnes pratiques |
| Ce que Claude **peut** faire | Comment Claude **devrait** le faire |

### Sans skills sur un MCP :
- Les utilisateurs se connectent mais ne savent pas quoi faire
- Tickets support "comment faire X avec votre intégration"
- Chaque conversation repart de zéro
- Résultats inconsistants

### Avec skills sur un MCP :
- Workflows pré-construits activés automatiquement
- Utilisation consistante et fiable des outils
- Bonnes pratiques embarquées dans chaque interaction
- Courbe d'apprentissage réduite

---

## Annexe B : Utiliser le Skill-Creator

Le skill `skill-creator` (disponible dans Claude.ai et Claude Code) aide à construire et itérer les skills.

### Commande de démarrage
```
"Utilise le skill skill-creator pour m'aider à construire un skill pour [ton use case]"
```

### Capacités
- **Création** : Génère des skills depuis une description en langage naturel
- **Review** : Flag les problèmes courants (descriptions vagues, triggers manquants)
- **Amélioration itérative** : Ramener les edge cases et échecs pour améliorer le skill
- **Optimisation de description** : Boucle d'optimisation pour affiner le triggering

### Workflow typique
1. Définir l'intention → 2. Interview & recherche → 3. Écrire le SKILL.md → 4. Tester → 5. Évaluer → 6. Itérer → 7. Packager

**Temps estimé pour un premier skill fonctionnel : 15-30 minutes.**

---

## Annexe C : Approche Problem-First vs Tool-First

**Problem-first :** *"J'ai besoin de configurer un workspace projet"* → Le skill orchestre les bons appels MCP dans la bonne séquence. L'utilisateur décrit le résultat souhaité, le skill gère les outils.

**Tool-first :** *"J'ai le MCP Notion connecté"* → Le skill enseigne à Claude les workflows optimaux et les bonnes pratiques. L'utilisateur a l'accès, le skill fournit l'expertise.

La plupart des skills penchent dans une direction. Savoir laquelle aide à choisir le bon pattern.

---

> **Version :** 1.0 — Compilé depuis "The Complete Guide to Building Skills for Claude" (Anthropic, Janvier 2026)
> **Usage :** Document de référence portable pour la création, le testing et le déploiement de skills Claude.
