# Contrats API & Serialisation

## Source de verite unique

| Approche | Quand l'utiliser |
|---|---|
| **Schemas Zod partages** (`lib/schemas/`) | Backend custom, Server Actions (recommande par defaut) |
| **tRPC** | Backend TypeScript, type-safe end-to-end |
| **Types generes ORM** | ORM avec types fiables + couche Zod en facade |
| **OpenAPI genere** | API REST externe avec contrat formel |

**Regle** : Le schema Zod est defini UNE SEULE FOIS dans `lib/schemas/`. Backend et frontend importent le meme schema. Si un champ est renomme, TypeScript detecte les erreurs partout.

## Structure d'un schema partage

```
lib/schemas/[entity].ts
  → entitySchema          (schema complet)
  → createEntitySchema    (pick des champs de creation)
  → updateEntitySchema    (partial des champs modifiables)
  → type Entity           (z.infer<typeof entitySchema>)
  → type CreateEntityInput
  → type UpdateEntityInput
```

**Jamais** definir manuellement un type qui existe deja dans un schema ou l'ORM.

## Validation en 3 couches

```
Couche 1 — Client (UX)      : Zod dans le formulaire (feedback instantane)
Couche 2 — Backend (securite): Validators + checks dans le handler
Couche 3 — DB (integrite)   : Schema DB = source de verite des types
```

**Ne JAMAIS faire confiance au client.** Toute validation client doit etre repliquee cote serveur.

## Validation des reponses externes

Toute reponse d'une **API externe** (pas sous votre controle) doit etre validee a la reception avec un schema Zod. Ne jamais faire confiance a `await res.json()` sans validation.

## Contract tests

Tout schema partage entre frontend et backend doit avoir un contract test en CI :
- Valider un objet complet
- Rejeter les champs manquants
- Rejeter les valeurs invalides

Les tests vivent dans `lib/schemas/__tests__/[entity].contract.test.ts`.

> Ref: Constitution V5 §8
