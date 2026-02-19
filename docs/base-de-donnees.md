# Base de données

## Formes normales (normalisation)

| Forme | Règle |
|---|---|
| **1NF** | Atomicité — chaque cellule contient une valeur unique |
| **2NF** | Dépendances — toute colonne dépend de la clé entière |
| **3NF** | Transitivité — pas de dépendance indirecte entre colonnes |

## Bonnes pratiques de modélisation

- **Tables de jointures** plutôt que ENUMs pour les relations multiples
- **Indexes** — en définir sur toutes les colonnes fréquemment filtrées ou jointurées

## Ressources Supabase (prompts AI)

- [Prompts AI Supabase](https://supabase.com/docs/guides/getting-started/ai-prompts)
- [Formattage SQL](https://supabase.com/docs/guides/getting-started/ai-prompts/code-format-sql)
- [Auth Next.js + Supabase](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth)
- [Politiques RLS](https://supabase.com/docs/guides/getting-started/ai-prompts/database-rls-policies)
