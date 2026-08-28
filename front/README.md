# Yoga

Application front-end de l'app "Yoga" (P5 - Full Stack Testing), générée avec [Angular CLI](https://github.com/angular/angular-cli) (v19.2.16).

## Sommaire

- [Architecture du projet](#architecture-du-projet)
- [Librairies principales](#librairies-principales)
- [Pré-requis](#pré-requis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Tests](#tests)
- [Rapports de couverture](#rapports-de-couverture)

## Architecture du projet

Le projet suit une architecture Angular **standalone** (pas de `NgModule` applicatif, hormis le module Angular Material regroupant les imports UI), organisée en trois grands dossiers sous `src/app` :

```
src/app
├── core/                # Logique transverse à l'application
│   ├── guards/           # AuthGuard, UnauthGuard (protection des routes)
│   ├── interceptors/      # jwt.interceptor (ajout du token JWT aux requêtes HTTP)
│   ├── models/            # Interfaces TypeScript (User, Session, Teacher, ...)
│   └── services/          # Services métier et d'accès à l'API (AuthService, SessionService, SessionApiService, UserService, TeacherService)
│
├── pages/                # Composants "pages", un dossier par route
│   ├── login/
│   ├── register/
│   ├── me/
│   ├── not-found/
│   └── sessions/          # Fonctionnalité "sessions" avec sous-composants
│       └── components/
│           ├── list/       # Liste des sessions
│           ├── detail/     # Détail d'une session
│           └── form/       # Création / édition d'une session
│
├── shared/               # Éléments réutilisables entre pages
│   ├── material.module.ts  # Regroupe les imports Angular Material
│   └── components/         # Composants UI génériques (icon-button, page-title, record-dates, session-image, nav-link, form-layout)
│
├── app.component.ts      # Composant racine
├── app.config.ts         # Configuration de l'application (providers HTTP, router, ...)
└── app.routes.ts         # Déclaration des routes et guards associés
```

Points clés :

- **Routing** : les routes sont déclarées dans [app.routes.ts](src/app/app.routes.ts) et protégées par `AuthGuard` (routes nécessitant une session active) ou `UnauthGuard` (routes accessibles uniquement si non connecté, ex. login/register).
- **HTTP & Auth** : `provideHttpClient` est configuré avec l'intercepteur `jwtInterceptor` ([app.config.ts](src/app/app.config.ts)) qui ajoute automatiquement le token JWT aux requêtes sortantes.
- **Services** : la communication avec le back-end passe par des services dédiés dans `core/services` (un service par ressource API : sessions, utilisateurs, enseignants), avec `SessionService` qui gère l'état de la session utilisateur en local (via RxJS).
- **UI** : le style est géré avec **Tailwind CSS** (utility classes) associé à **Angular Material** pour les composants d'interface (regroupés dans `shared/material.module.ts`).
- **Tests** : chaque composant/service critique dispose d'un fichier `.spec.ts` (tests unitaires Jest) ; des tests end-to-end complémentaires sont écrits avec Cypress.

## Librairies principales

### Dépendances (runtime)

| Librairie | Version | Rôle |
|---|---|---|
| `@angular/core` (+ `common`, `forms`, `router`, `platform-browser`...) | ^19.2.0 | Framework Angular |
| `@angular/material` + `@angular/cdk` | ^19.2.19 | Composants UI Material Design |
| `rxjs` | ~7.8.0 | Programmation réactive (Observables), utilisé notamment par `SessionService` |

### Dépendances de développement

| Librairie | Version | Rôle |
|---|---|---|
| `@angular-devkit/build-angular` | ^19.2.17 | Outils de build Angular CLI |
| `angular-eslint` / `eslint` / `typescript-eslint` | 21.0.1 / ^9.36.0 / ^8.44.0 | Linting du code |
| `jest` (+ `@angular-builders/jest`) | ^29.7.0 | Tests unitaires |
| `cypress` | ^15.2.0 | Tests end-to-end (E2E) |
| `nyc` | ^17.1.0 | Rapports de couverture (E2E) |
| `tailwindcss` (+ `postcss`, `autoprefixer`) | ^3.4.19 | Framework CSS utilitaire |

## Pré-requis

- **Node.js** 20+ et **npm** 9+
- Le **back-end** doit tourner sur `http://localhost:8080` pour que l'application soit
  fonctionnelle (authentification, sessions...). Voir `back/README.md` pour le démarrer
  (`mvn spring-boot:run`, avec Docker pour la base MySQL).

## Installation

Cloner le dépôt

Se placer dans le dossier du front et installer les dépendances :

```bash
cd front
npm install
```

## Utilisation

Lancer le serveur de développement :

```bash
npm run start
```

L'application est disponible sur `http://localhost:4200`. Les appels `/api/**` sont
automatiquement redirigés vers le back-end `http://localhost:8080` via `proxy.conf.json`.

Compte administrateur créé par défaut (seed du back-end) :

- login : `yoga@studio.com`
- password : `test!1234`

Il est également possible de créer un compte utilisateur classique via la page **Register**.

Build de production :

```bash
npm run build
```

Lint :

```bash
npm run lint
```

## Tests

### Tests unitaires (Jest)

Lancer les tests :

```bash
npm run test
```

Relancer automatiquement à chaque changement :

```bash
npm run test:watch
```

### Tests end-to-end (Cypress)

Mode interactif (ouvre l'interface Cypress) :

```bash
npm run cypress:open
```

Mode headless (exécution complète en ligne de commande, avec instrumentation de la
couverture) :

```bash
npm run e2e
```

## Rapports de couverture

### Couverture des tests unitaires (Jest)

```bash
npm run test -- --coverage
```

Le rapport HTML est généré dans :

```
front/coverage/jest/lcov-report/index.html
```

Le seuil de couverture est fixé à **80 % de statements** (`coverageThreshold` dans `jest.config.js`).

### Couverture des tests E2E (Cypress + nyc/Istanbul)

1. Exécuter d'abord les tests E2E qui produisent les données de couverture :

   ```bash
   npm run e2e
   ```

2. Générer le rapport à partir de ces données :

   ```bash
   npm run e2e:coverage
   ```

Le rapport HTML est disponible ici :

```
front/coverage/lcov-report/index.html
```
