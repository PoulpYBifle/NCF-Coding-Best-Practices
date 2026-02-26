# Principes de développement

## Les 5 commandements

```
1. KISS > Clever       — La solution ennuyeuse qui marche bat le hack elegant.
2. DRY au bon moment   — Ne pas factoriser avant 3 occurrences ET des raisons
                         de changement identiques. (Sandi Metz)
3. SRP > God Object    — Un fichier fait UNE chose. Un composant rend UN concept.
4. Explicit > Magic    — Pas de comportements caches. Le code se lit comme une histoire.
5. Delete > Comment    — Du code mort se supprime. Un commentaire explique le "pourquoi",
                         jamais le "quoi".
```

## Meta-regle : Politique d'exception

Aucune regle n'est absolue. Une exception est acceptable **uniquement si** :
1. Le cout de la regle depasse le benefice immediat
2. Elle est documentee : `// EXCEPTION: [raison]`
3. Elle est locale — pas un pattern a repeter

## La regle des 3 (avec jugement)

- **3 lignes identiques** avec la meme raison de changement → extraire une fonction
- **3 props similaires** entre composants → extraire un composant partage
- **3 fichiers** qui font le meme pattern → extraire un hook ou helper

> Deux fonctions backend qui valident un email de la meme facon → factoriser.
> Deux composants qui ont 3 lignes de JSX similaires mais des evolutions independantes → NE PAS factoriser.

## La regle des 5 minutes

Un nouveau developpeur (ou un agent IA) doit pouvoir comprendre ce que fait un fichier en **5 minutes max**. Si ca prend plus longtemps, le fichier est trop complexe.

## Principes detailles

- **DRY** – Don't Repeat Yourself
- **KISS** – Keep It Simple, Stupid
- **SOLID** – Single Responsibility Principle en priorite
- **YAGNI** – You Aren't Gonna Need It

## Methode de priorisation : MoSCoW

| Categorie | Signification |
|---|---|
| **Must have** | Indispensable — a livrer |
| **Should have** | Important — a livrer si possible |
| **Could have** | Bonus — si le temps le permet |
| **Won't have** | Pour plus tard — hors scope |

**Prompt MoSCoW :**
> "Voici ma liste MoSCoW. Je veux que tu ignores totalement les categories Should, Could et Won't pour l'instant. Concentre-toi uniquement sur le Must Have pour garantir un code KISS et solide."

## Methode de planification : BMAD

- **Brainstorm** — Exploration libre des idees
- **Epics & Stories** — Structuration en unites de travail livrable

## Contraintes de taille de fichiers

| Seuil | Action |
|---|---|
| < 150 lignes | Ideal |
| 150-300 lignes | Acceptable si une seule responsabilite |
| 300-500 lignes | Decomposer. Extraire hooks et sous-composants. |
| > 500 lignes | **Interdit.** Scinder obligatoirement. |

> Ref: Constitution V5 §0, §1
