# Base de donnees

## Formes normales (normalisation)

| Forme | Regle |
|---|---|
| **1NF** | Atomicite — chaque cellule contient une valeur unique |
| **2NF** | Dependances — toute colonne depend de la cle entiere |
| **3NF** | Transitivite — pas de dependance indirecte entre colonnes |

## Bonnes pratiques de modelisation

- **Tables de jointures** plutot que ENUMs pour les relations multiples
- **Contraintes d'unicite** en base = filet de securite contre les race conditions

## Indexation

Tout champ utilise dans un `WHERE`, `ORDER BY`, ou `JOIN` frequent doit avoir un index.

| Pattern | Index recommande |
|---|---|
| Filtre par `teamId` + tri par `createdAt` | Index compose `(teamId, createdAt)` |
| Recherche par `email` (unicite) | Index unique sur `email` |
| Soft delete : filtre `deletedAt IS NULL` | Index partiel |
| Cursor-based pagination par `id` | Index sur `id` (souvent la PK) |

## Migrations — Regle additive-first

**Tout nouveau champ est optionnel par defaut.** On ne rend un champ obligatoire qu'apres avoir backfille 100% des donnees existantes.

```
Phase 1 : Ajouter le champ optionnel → deployer
Phase 2 : Backfill les donnees existantes (batch borne, max 100 rows)
Phase 3 : Une fois 100% migre → le champ peut devenir obligatoire
```

| Type de migration | Strategie | Risque |
|---|---|---|
| Ajout de champ | Optionnel → backfill → obligatoire | Faible |
| Suppression de champ | Ignorer en lecture → retirer du schema | Moyen |
| Renommage de champ | Ajouter nouveau → copier → supprimer ancien | Moyen |
| Changement de type | Nouveau champ → migration → suppression | Eleve |

**Regles** : Jamais de migration destructive sans backup. 1 fichier par migration (`NNN-description.ts`).

## Soft delete — Table de decision

| Entite | Soft delete ? | Raison |
|---|---|---|
| Projet, document, workspace | Oui | Valeur de retention, undo |
| Session, token, OTP | Non | Ephemere |
| Donnees RGPD (demande utilisateur) | Hard delete | Obligation legale |
| Commentaires visibles par d'autres | Selon contexte | |

**Pattern** : champ `deletedAt: number | null`. Toutes les queries filtrent `deletedAt === null` par defaut. Purge automatique apres N jours.

## Gestion des dates

| Type | Format en base | Exemple |
|---|---|---|
| Datetime (horodatage precis) | `number` (timestamp ms UTC) | `createdAt`, `updatedAt` |
| Date-only (date calendaire) | `string` (`YYYY-MM-DD`) | `birthDate`, `dueDate` |

- **Backend ne formate jamais de dates** — le frontend connait la locale et le timezone
- Toujours mettre a jour `updatedAt` sur chaque patch

## Ressources Supabase (prompts AI)

- [Prompts AI Supabase](https://supabase.com/docs/guides/getting-started/ai-prompts)
- [Formattage SQL](https://supabase.com/docs/guides/getting-started/ai-prompts/code-format-sql)
- [Auth Next.js + Supabase](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth)
- [Politiques RLS](https://supabase.com/docs/guides/getting-started/ai-prompts/database-rls-policies)

> Ref: Constitution V5 §14, §15, §16
