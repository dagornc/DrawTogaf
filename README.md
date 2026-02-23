# DrawTogaf

> **Plateforme interactive de modelisation d'architectures d'entreprise TOGAF**
> Visualisez, editez et exportez vos diagrammes TOGAF en temps reel avec un canvas collaboratif, une API GraphQL et une interface React moderne.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-5.0-DC382D?logo=redis)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table des matieres

- [Presentation](#presentation)
- [Fonctionnalites](#fonctionnalites)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [API](#api)
- [Export](#export)
- [Roadmap](#roadmap)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Presentation

**DrawTogaf** est une application web full-stack permettant de concevoir et de visualiser des architectures d'entreprise selon le framework **TOGAF (The Open Group Architecture Framework)**.

L'outil offre un canvas interactif pour dessiner des diagrammes d'architecture (metiers, applicatifs, techniques, donnees), les stocker en base de donnees, les collaborer en equipe et les exporter en PowerPoint ou PDF.

Concu pour les architectes d'entreprise, les consultants en transformation numerique et les equipes DSI, DrawTogaf simplifie la creation et la maintenance des livrables TOGAF.

---

## Fonctionnalites

### Canvas interactif
- **Diagrammes de flux** avec React Flow (`@xyflow/react`) : noeuds, aretes, layouts automatiques via ELK.js
- **Canvas libre** avec tldraw (`tldraw` + `@tldraw/sync`) pour les schemas informels et collaboratifs
- **Auto-layout** des diagrammes avec l'algorithme ELK (Eclipse Layout Kernel)
- Glisser-deposer, zoom, pan, minimap

### Domaines TOGAF
- **Architecture Metier** : processus, acteurs, roles, capacites
- **Architecture Applicative** : composants applicatifs, interfaces, flux de donnees
- **Architecture Technique** : infrastructure, deployments, reseaux
- **Architecture des Donnees** : entites, flux, referentiels

### Backend et Persistence
- API REST avec **FastAPI** + schemas **Pydantic**
- API **GraphQL** avec **Strawberry** pour les requetes avancees
- Persistance **PostgreSQL** via **SQLAlchemy**
- Cache **Redis** pour les sessions et la collaboration en temps reel
- Authentification **JWT** (`pyjwt`)

### Export
- Export **PowerPoint (.pptx)** via `python-pptx`
- Export PDF (via impression navigateur)
- Partage par lien

### Internationalisation
- Support multilingue avec **i18next** et `react-i18next`
- Francais et anglais inclus

---

## Architecture

```mermaid
graph TB
  subgraph Frontend
    A[React Router] --> B[Canvas React Flow]
    A --> C[Canvas tldraw]
    B --> D[ELK Auto-layout]
    B --> E[Composants TOGAF]
  end

  subgraph Backend
    F[API REST FastAPI] --> H[Services]
    G[API GraphQL Strawberry] --> H
    H --> I[SQLAlchemy ORM]
    H --> J[Cache Redis]
    H --> K[Export PPTX]
  end

  subgraph Data
    I --> L[(PostgreSQL)]
    J --> M[(Redis)]
  end

  Frontend -- Axios HTTP --> F
  Frontend -- GraphQL queries --> G
```

---

## Stack technique

### Frontend

| Technologie | Version | Role |
|---|---|---|
| React | 19.2 | Framework UI |
| TypeScript | 5.9 | Typage statique |
| Vite | 7.2 | Bundler et dev server |
| @xyflow/react | 12.10 | Diagrammes de flux interactifs |
| tldraw | 4.2 | Canvas collaboratif libre |
| ELK.js | 0.11 | Auto-layout de graphes |
| Tailwind CSS | 3.4 | Styling utilitaire |
| react-router-dom | 7.10 | Navigation SPA |
| i18next | 25.7 | Internationalisation |
| Axios | 1.13 | Client HTTP |
| Radix UI | 1.2 | Composants accessibles |
| Lucide React | 0.556 | Icones |

### Backend

| Technologie | Version | Role |
|---|---|---|
| FastAPI | 0.104 | Framework API REST |
| Uvicorn | 0.24 | Serveur ASGI |
| Pydantic | 2.5 | Validation des schemas |
| SQLAlchemy | 2.0 | ORM Python |
| PostgreSQL | 15 | Base de donnees relationnelle |
| Redis | 5.0 | Cache et sessions |
| Strawberry GraphQL | 0.213 | API GraphQL |
| PyJWT | 2.8 | Authentification JWT |
| python-pptx | 0.6 | Export PowerPoint |
| httpx | 0.25 | Client HTTP async |
| python-dotenv | 1.0 | Variables d'environnement |

---

## Structure du projet

```
DrawTogaf/
|-- backend/                    # API Python (FastAPI)
|   |-- app/
|   |   |-- api/                # Routes REST et GraphQL
|   |   |-- core/               # Configuration, securite, BDD
|   |   |-- services/           # Logique metier
|   |   |-- main.py             # Point d'entree FastAPI
|   |-- tests/                  # Tests pytest
|   |-- requirements.txt
|   |-- .env
|
|-- frontend/                   # SPA React + TypeScript
|   |-- src/
|   |   |-- components/         # Composants React
|   |   |-- pages/              # Vues et routes
|   |   |-- hooks/              # Custom hooks
|   |   |-- services/           # Appels API
|   |   |-- types/              # Types TypeScript
|   |-- public/
|   |-- index.html
|   |-- package.json
|   |-- vite.config.ts
|
|-- start.sh                    # Script de demarrage global
|-- reproduce_issue.py          # Script de reproduction de bugs
```

---

## Installation

### Prerequis

- Node.js >= 20
- Python >= 3.11
- PostgreSQL >= 15
- Redis >= 7

### 1. Cloner le depot

```bash
git clone https://github.com/dagornc/DrawTogaf.git
cd DrawTogaf
```

### 2. Configurer le backend

```bash
cd backend
cp .env.example .env
# Editer .env avec vos variables

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Configurer le frontend

```bash
cd frontend
npm install
```

### 4. Demarrage rapide

```bash
# Depuis la racine du projet
./start.sh
```

Ou manuellement :

```bash
# Terminal 1 - Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

L'application est disponible sur `http://localhost:5173`, l'API sur `http://localhost:8000`.

---

## Utilisation

### Creer un nouveau diagramme TOGAF

1. Ouvrir l'application sur `http://localhost:5173`
2. Cliquer sur **Nouveau diagramme**
3. Selectionner le domaine TOGAF : Metier, Applicatif, Technique ou Donnees
4. Utiliser la palette pour ajouter des noeuds (acteurs, applications, serveurs...)
5. Relier les elements avec des aretes
6. Utiliser **Auto-layout** (ELK) pour reorganiser automatiquement le diagramme

### Exporter en PowerPoint

1. Ouvrir le menu **Exporter**
2. Selectionner **Export PowerPoint (.pptx)**
3. Le fichier est genere cote serveur et telecharge automatiquement

### Canvas libre tldraw

1. Basculer sur le mode **Canvas libre** dans la barre d'outils
2. Dessiner librement : annotations, formes, fleches
3. Le canvas est synchronise en temps reel via `@tldraw/sync`

---

## API

### REST (FastAPI)

Documentation interactive disponible sur `http://localhost:8000/docs` (Swagger UI).

```http
GET    /api/diagrams            # Lister les diagrammes
POST   /api/diagrams            # Creer un nouveau diagramme
GET    /api/diagrams/{id}       # Recuperer un diagramme
PUT    /api/diagrams/{id}       # Mettre a jour
DELETE /api/diagrams/{id}       # Supprimer
POST   /api/export/pptx         # Exporter en PowerPoint
POST   /auth/token              # Obtenir un token JWT
```

### GraphQL (Strawberry)

Playground disponible sur `http://localhost:8000/graphql`.

```graphql
query GetDiagrams {
  diagrams {
    id
    name
    domain
    nodes {
      id
      type
      label
      position { x y }
    }
    edges {
      id
      source
      target
      label
    }
  }
}
```

---

## Export

| Format | Methode | Description |
|---|---|---|
| PowerPoint (.pptx) | API Backend | Slides auto-generes avec python-pptx |
| PDF | Impression navigateur | Via menu Exporter ou Ctrl+P |
| JSON | API REST | Format brut du diagramme |
| PNG/SVG | React Flow | Capture du canvas |

---

## Variables d'environnement

```env
# Base de donnees
DATABASE_URL=postgresql://user:password@localhost:5432/drawtogaf

# Redis
REDIS_URL=redis://localhost:6379/0

# Securite
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]
```

---

## Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run lint
```

---

## Roadmap

- [x] Canvas React Flow avec noeuds TOGAF
- [x] Canvas libre tldraw avec synchronisation
- [x] API REST FastAPI
- [x] API GraphQL Strawberry
- [x] Persistance PostgreSQL + Redis
- [x] Export PowerPoint
- [x] Authentification JWT
- [x] Internationalisation FR/EN
- [ ] Collaboration temps reel multi-utilisateurs
- [ ] Import depuis ArchiMate / ArchiStudio
- [ ] Versioning des diagrammes (historique)
- [ ] Mode presentation integre
- [ ] Integration LLM pour generation de diagrammes
- [ ] Deploiement Docker Compose
- [ ] Support TOGAF 10 complet

---

## Contribution

1. Forker le depot
2. Creer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Committer : `git commit -m 'feat: ajouter ma fonctionnalite'`
4. Pousser : `git push origin feature/ma-fonctionnalite`
5. Ouvrir une Pull Request

---

## Licence

Ce projet est sous licence **MIT**.

---

> Construit avec passion par [dagornc](https://github.com/dagornc)
