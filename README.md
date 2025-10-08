# 🏢 Green Energy Park - IFC Viewer

Application web full-stack pour la visualisation de modèles BIM (IFC) couplée à un système de monitoring en temps réel de capteurs IoT.

## 📋 Description

**Green Energy Park** combine trois fonctionnalités principales :
- 🔐 **Système d'authentification sécurisé** avec gestion de sessions
- 🏗️ **Visualisation 3D de modèles IFC** directement dans le navigateur
- 📊 **Monitoring temps réel** de capteurs IoT (température, humidité, CO2)

---

## 🎯 Choix des Technologies

### **Frontend : Angular 20**
**Pourquoi Angular ?**
- ✅ TypeScript natif pour la sécurité des types
- ✅ Architecture modulaire et scalable
- ✅ Dependency Injection intégrée
- ✅ RxJS pour la programmation réactive (polling temps réel)
- ✅ CLI puissant pour développement rapide
- ✅ Parfait pour applications d'entreprise

**Bibliothèques utilisées :**
- **web-ifc-viewer** : Parsing et rendu 3D des fichiers IFC
- **Bootstrap 5** : UI responsive et moderne
- **RxJS** : Gestion des flux de données asynchrones

### **Backend : Node.js + Express**
**Pourquoi Node.js ?**
- ✅ JavaScript full-stack (même langage frontend/backend)
- ✅ Architecture event-driven, parfait pour I/O temps réel
- ✅ Non-bloquant et performant pour requêtes simultanées
- ✅ Large écosystème npm
- ✅ Idéal pour APIs REST et applications temps réel

### **Base de Données : SQLite (Prototype)**
**Pourquoi SQLite ?**
- ✅ Zero configuration (fichier unique)
- ✅ Parfait pour prototypage rapide
- ✅ SQL standard (migration facile vers PostgreSQL)
- ✅ Léger et portable

**Pour production :** Migration prévue vers **TimescaleDB** (optimisé pour séries temporelles)

---

## 🚀 Installation et Démarrage

### **Prérequis**
- Node.js v18+ et npm
- Angular CLI (`npm install -g @angular/cli`)
- Git

### **1. Cloner le projet**
```bash
git clone [https://github.com/tahaelallam666/ifc-viewer.git](https://github.com/tahaelallam666/ifc-viewer.git)
cd ifc-viewer
