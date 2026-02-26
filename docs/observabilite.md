# Observabilite

## Les 3 piliers

| Pilier | Quoi | Outil typique |
|---|---|---|
| **Logs** | Evenements structures (JSON) | Pino, Winston, Axiom |
| **Metriques** | Compteurs numeriques (RED) | Prometheus, Datadog, Vercel Analytics |
| **Traces** | Cheminement d'une requete | Sentry, OpenTelemetry |

## Logger structure

- **Pas de `console.log` en production.** En dev, tolere pour debug temporaire mais supprime avant commit.
- Utiliser un logger structure (Pino recommande, ou logger minimal JSON).
- Format : JSON en prod (ingestion Datadog/Sentry/Axiom), pretty-print en dev.
- Chaque log inclut des metadonnees : `userId`, `correlationId`, `projectId`, etc.

## Correlation ID

Chaque requete utilisateur recoit un ID unique qui la suit partout :

1. **Middleware** : generer ou propager `x-correlation-id` via header
2. **Backend** : inclure le `correlationId` dans chaque log
3. **Frontend** : envoyer le `x-correlation-id` dans chaque requete fetch

## Error tracking

Integrer un service (Sentry recommande) des le premier deploiement :
- Source maps uploadees a chaque deploy
- Breadcrumbs automatiques (navigation, clicks, fetches)
- Correlation avec le correlation ID
- Alertes sur les nouvelles erreurs

## Metriques RED

Pour chaque endpoint/mutation critique :

| Metrique | Quoi | Alerte si |
|---|---|---|
| **Rate** | Requetes/minute | Chute brutale |
| **Errors** | % requetes en erreur | > 1% sur 5 min |
| **Duration** | Temps de reponse p50/p95/p99 | p95 > 2s |

## Budget alerte minimal

| Alerte | Seuil | Canal |
|---|---|---|
| Erreur 5xx > 1% pendant 5 min | Critique | Slack/PagerDuty |
| Latence p95 > 3s pendant 10 min | Warning | Slack |
| Nouvelle erreur non-vue | Info | Email/Sentry |
| Quota DB / API IA > 80% | Warning | Slack |

> Ref: Constitution V5 §19
