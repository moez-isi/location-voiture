# 🚗 Location de Voiture - Application Complète

Application de gestion de location de voiture avec :
- **Frontend** : Angular 17 + Angular Material
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL

---

## 📁 Structure du projet

```
location-voiture/
├── database.sql          ← Script SQL (création tables + données test)
├── backend/              ← API Node.js
│   ├── server.js
│   ├── config/database.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── vehicules.js
│   │   ├── locations.js
│   │   ├── retours.js
│   │   └── dashboard.js
│   ├── .env
│   └── package.json
└── frontend/             ← Application Angular
    ├── src/app/
    │   ├── app.component.ts
    │   ├── app.config.ts
    │   ├── app.routes.ts
    │   ├── guards/auth.guard.ts
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   ├── client.service.ts
    │   │   ├── vehicule.service.ts
    │   │   ├── location.service.ts
    │   │   ├── retour.service.ts
    │   │   └── dashboard.service.ts
    │   └── components/
    │       ├── login/login.component.ts
    │       ├── dashboard/dashboard.component.ts
    │       ├── clients/clients.component.ts
    │       ├── vehicules/vehicules.component.ts
    │       ├── locations/locations.component.ts
    │       └── retours/retours.component.ts
    ├── package.json
    ├── angular.json
    └── tsconfig.json
```

---

## ⚡ Installation rapide (5 minutes)

### Étape 1 : PostgreSQL

1. Ouvre **pgAdmin** (installé avec PostgreSQL)
2. Crée une base nommée `location_voiture`
3. Ouvre l'outil **Query Tool** sur cette base
4. Copie-colle le contenu de `database.sql` et exécute (F5)

> Le script crée toutes les tables + un agent par défaut + données de test.

### Étape 2 : Backend

```bash
cd backend

# Installer les dépendances
npm install

# Modifier le fichier .env avec TON mot de passe PostgreSQL
# DB_PASSWORD=ton_mot_de_passe_ici

# Lancer le serveur
npm start
```

Le backend démarre sur **http://localhost:3000**

### Étape 3 : Frontend

> ⚠️ **Important** : Le frontend Angular doit être créé avec la CLI Angular. Les fichiers sources sont fournis, mais tu dois initialiser le projet.

```bash
# Ouvre un NOUVEAU terminal

# Créer le projet Angular (dans un dossier temporaire)
npx @angular/cli@17 new location-voiture-frontend --standalone --routing --style=css

# Remplace les fichiers générés par ceux fournis
cd location-voiture-frontend

# Copie tous les fichiers du dossier frontend/ fourni ici
# (remplace src/, package.json, angular.json, tsconfig.json)

# Installer Angular Material
ng add @angular/material

# Lancer l'application
ng serve
```

Le frontend démarre sur **http://localhost:4200**

---

## 🔑 Identifiants de connexion

| Champ | Valeur |
|-------|--------|
| Email | `admin@location.com` |
| Mot de passe | `admin123` |

---

## 🛠️ Fonctionnalités

### Agent
- ✅ Connexion sécurisée avec JWT
- ✅ Déconnexion

### Clients
- ✅ Liste des clients
- ✅ Ajouter / Modifier / Supprimer
- ✅ Recherche par nom

### Véhicules
- ✅ Liste des véhicules
- ✅ Ajouter / Modifier / Supprimer
- ✅ Statut : Disponible / Loué / Maintenance

### Locations
- ✅ Créer une location (client + véhicule disponible + dates)
- ✅ Calcul automatique du montant
- ✅ Liste avec statut
- ✅ Retour véhicule (termine la location)
- ✅ Annuler une location

### Retours
- ✅ Enregistrer un retour avec état du véhicule
- ✅ Historique des retours
- ✅ Le véhicule repasse automatiquement en "disponible"

### Tableau de bord
- ✅ Stats en temps réel (clients, véhicules, locations, revenus)
- ✅ Dernières locations

---

## 📡 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Créer agent |
| GET | `/api/clients` | Liste clients |
| POST | `/api/clients` | Ajouter client |
| PUT | `/api/clients/:id` | Modifier client |
| DELETE | `/api/clients/:id` | Supprimer client |
| GET | `/api/vehicules` | Liste véhicules |
| GET | `/api/vehicules/disponibles` | Véhicules dispo |
| POST | `/api/vehicules` | Ajouter véhicule |
| PUT | `/api/vehicules/:id` | Modifier véhicule |
| DELETE | `/api/vehicules/:id` | Supprimer véhicule |
| GET | `/api/locations` | Liste locations |
| GET | `/api/locations/en-cours` | Locations actives |
| POST | `/api/locations` | Créer location |
| PUT | `/api/locations/:id/retour` | Retour véhicule |
| PUT | `/api/locations/:id/annuler` | Annuler location |
| GET | `/api/retours` | Liste retours |
| POST | `/api/retours` | Enregistrer retour |
| GET | `/api/dashboard/stats` | Stats dashboard |
| GET | `/api/dashboard/recent-locations` | Dernières locations |

---

## 🔧 Technologies utilisées

| Couche | Technologie |
|--------|-------------|
| Frontend | Angular 17, Angular Material, RxJS |
| Backend | Node.js, Express, JWT, bcryptjs |
| Base de données | PostgreSQL |
| Outils | pgAdmin, Postman (optionnel) |

---

## ❓ Problèmes fréquents

**Erreur CORS** → Vérifie que le backend tourne sur le port 3000 et que `cors` est configuré.

**Erreur connexion BDD** → Vérifie le mot de passe dans `.env` et que PostgreSQL est démarré.

**Port déjà utilisé** → Change le port dans `.env` (PORT=3001) ou tue le processus : `npx kill-port 3000`

---

## 📧 Contact

Projet créé pour débutants. N'hésite pas à modifier et expérimenter !
