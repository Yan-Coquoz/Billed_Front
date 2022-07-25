
## L'architecture du projet

Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.

Le projet backend se trouve ici: <https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back>

## Organiser son espace de travail

Pour une bonne organization, vous pouvez créer un dossier bill-app dans lequel vous allez cloner le projet backend et par la suite, le projet frontend:

Clonez le projet backend dans le dossier bill-app :

```bash
git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
```

```bash
bill-app/
   - Billed-app-FR-Back
```

Clonez le projet frontend dans le dossier bill-app :

```bash
git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git
```

```bash
bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front
```

## Comment lancer l'application en local ?

### étape 1 - Lancer le backend

Suivez les indications dans le README du projet backend.

### étape 2 - Lancer le frontend

Allez au repo cloné :

```bash
cd Billed-app-FR-Front
```

Installez les packages npm (décrits dans `package.json`) :

```bash
npm install
```

Installez live-server pour lancer un serveur local :

```bash
npm install -g live-server
```

Lancez l'application :

```bash
live-server
```

Puis allez à l'adresse : `http://127.0.0.1:5501/`

## Comment lancer tous les tests en local avec Jest ?

```bash
npm run test
```

## Comment lancer un seul test ?

Installez jest-cli :

```bash
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## Comment voir la couverture de test ?

`http://127.0.0.1:5501/coverage/lcov-report/`

## Comptes et utilisateurs

Vous pouvez vous connecter en utilisant les comptes:

### administrateur

```
utilisateur : admin@test.tld 
mot de passe : admin
```

### employé

```
utilisateur : employee@test.tld
mot de passe : employee
```

## Pour l’installation du projet sur Windows avec Visual Studio Code

- Créer un dossier Bill-App
- L’initialiser :
    $ git init
- Copier le code Backend :
    $ git clone <https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git>
- Copier le code frontend :
    $ git clone <https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git>
- Ouvrir chaque dossier dans un terminal « T » différent :
    T1
    $ cd Billed-app-FR-Back
    $ npm i
    $ npm i -g sequelize
    $ npm i -g sequelize-cli
    $ npm i -g jest
    $ npm install -g win-node-env (installation du back)

  - Ouvrir le fichier « package.json » et ajouter « set » et « && » SANS ESPACE AVANT &&
    "test":
  - "set NODE_ENV=test&& sequelize-cli db:migrate&& jest test -i tests/user.test.js --watch"
  - "run:dev": "set NODE_ENV=development&& sequelize-cli db:migrate&& node server.js",

    $ npm run run:dev (lance le back)

    T2
    $ cd Billed-app-FR-Front
    $ npm install
    $ npm install -g live-server
    $ live-server
    si le site n’est pas lancé automatiquement :
        adresse : <http://127.0.0.1:5501/>

Ensuite pour relancer votre projet si tout est fermé, vous n’aurez qu’à refaire les opérations en gras
