# Yoga App — Backend

API REST de l'application **Yoga App** (P5 – Full Stack Testing).
Spring Boot 3.5 / Java 21, sécurité par JWT, base de données MySQL (via Docker Compose).

## Sommaire

- [Pré-requis](#pré-requis)
- [Installation](#installation)
- [Lancer l'application](#lancer-lapplication)
- [Base de données & utilisateur par défaut](#base-de-données--utilisateur-par-défaut)
- [Lancer les tests](#lancer-les-tests)
- [Générer le rapport de couverture](#générer-le-rapport-de-couverture)
- [Ressources](#ressources)

## Pré-requis

| Outil | Version |
|---|---|
| JDK | 21 |
| Maven | 3.9.3 ou plus |
| Docker + Docker Compose | requis pour la base MySQL au démarrage de l'app |

> Les tests n'ont **pas** besoin de Docker : ils utilisent une base H2 en mémoire.

## Installation

Cloner le dépôt et se placer dans le dossier du back.

Installer les dépendances (sans exécuter les tests) :

```bash
mvn clean install -DskipTests
```

## Lancer l'application

1. Démarrer **Docker Desktop** sur votre poste.
2. À la racine du dossier `back`, exécuter :

```bash
mvn spring-boot:run
```

Cette commande :

- initialise le container Docker `back_mysql` (base MySQL) via `compose.yaml` ;
- démarre l'API sur le port **8080** (`http://localhost:8080`).

L'application est prête quand les logs affichent
`Started SpringBootSecurityJwtApplication in ... seconds`.

Sur Docker Desktop, un container MySQL correspondant au projet apparaît :

![1-docker-desktop](pictures/1-docker-desktop.png)

## Base de données & utilisateur par défaut

La table `USERS` est créée automatiquement au démarrage. Pour insérer l'utilisateur
admin par défaut, se connecter au container `back_mysql` (onglet **Exec** de Docker Desktop) :

```bash
mysql -u user_test -p            # mot de passe : test_password
```

```sql
use test;
INSERT INTO users(first_name, last_name, admin, email, password)
VALUES ('Admin', 'Admin', true, 'yoga@studio.com',
        '$2a$10$.Hsa/ZjUVaHqi0tp9xieMeewrnZxrZ5pQRzddUXE/WjDu2ZThe6Iq');
select * from users;
```

Le contenu SQL est aussi disponible dans `src/main/resources/sql/insert_user.sql`.

Identifiants de connexion créés :

- login : `yoga@studio.com`
- password : `test!1234`

![2-docker-desktop-bdd](pictures/2-docker-desktop-bdd.png)

## Lancer les tests

Le projet contient :

- des **tests unitaires** (services, sécurité, JWT) — Mockito ;
- des **tests d'intégration** des controllers — `@SpringBootTest` + `MockMvc`, profil
  `integration` (base H2 en mémoire, cf. `src/test/resources/application-integration.yml`).

Lancer l'ensemble des tests :

```bash
mvn clean test
```

Lancer une seule classe de test :

```bash
mvn test -Dtest=SessionServiceTest
```

## Générer le rapport de couverture

La couverture est mesurée par **JaCoCo**, branché sur la phase `test` de Maven.
Il suffit donc de lancer les tests :

```bash
mvn clean test
```

Le rapport HTML est généré ici :

```
target/site/jacoco/index.html
```

## Ressources

### Collection Postman

Importer la collection : `postman/yoga.postman_collection.json`

Documentation : https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman

### Frontend

Le frontend Angular et sa documentation se trouvent dans le dossier `../front`.
