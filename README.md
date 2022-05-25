# Description
Scan le chat twitch etajoute automatiquement dans une base de données quand DollexBot pointe un utilisateur.

Compte également le nombre de message par utilisateur et par stream mais seulement quand le live est lancé.

# Installer

Pour faire fonctionner ce code vous devez d'abord installer :

[mysqlJS](https://github.com/mysqljs/mysql)
```sh
$ npm install mysqljs/mysql
```

[tmi.js](https://tmijs.com/)
```sh
$ npm i tmi.js
```
[node-twitch](https://github.com/Plazide/node-twitch)
```sh
$ npm install node-twitch
```

# Base de données

Un script MySQL est disponible pour créer rapidement une base de donnée

# Configuration

il faut également configurer divers variable dans le code
(la description de celle ci étant en commmentaire)

# Lancer

Exécuter simplement le fichier dans une invite de commande via [nodejs](https://nodejs.org/fr/)