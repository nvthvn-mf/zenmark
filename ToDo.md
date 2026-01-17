# Plan Fonctionnel & Monétisation

## 1. Feat à corriger : Option de suppression sur les fichiers récents (Dashboard)

### Constat
Actuellement, le composant **DashboardView** affiche les cartes des documents, mais l'interaction principale (le clic) ouvre le document.  
Il manque un bouton dédié (ex. : une icône 🗑️) pour supprimer sans ouvrir.

### Analyse technique
- **Backend / Controller**
    - La fonction `DocumentController.deleteDocument(id)` existe déjà et fonctionne (utilisée dans la Sidebar).
    - 👉 Aucune modification nécessaire.

- **Frontend (UI)**
    - Modifier le JSX de la carte du document dans `DashboardView`.

- **Point de vigilance — le piège classique : le Click Bubbling**
    - Si un bouton supprimer est ajouté dans une carte cliquable, cliquer sur la poubelle peut aussi ouvrir le document.
    - **Solution** : utiliser `event.stopPropagation()` sur le bouton de suppression pour empêcher l'ouverture du document.

### Verdict
✅ **Très facile** — modification visuelle et gestion d'événement uniquement dans `DashboardView`.

---

## 2. Feat à ajouter : Fonction de déplacement (Explorer)

### Le besoin
Pouvoir prendre un fichier (ou un dossier) et le déplacer dans un autre dossier.

### Analyse technique

#### Backend / Base de données
- **Fichiers**
    - La table `documents` possède déjà la colonne `folder_id`.
    - La méthode `DocumentController.moveDocument` existe déjà.

- **Dossiers**
    - La table `folders` possède la colonne `parent_id`.
    - À ajouter : `FolderController.moveFolder(folderId, targetFolderId)`.

#### Frontend (UI) — le défi UX
Comment l'utilisateur déclenche le déplacement ?

- **Option A — Drag & Drop**
    - Très intuitif.
    - Techniquement lourd (librairies type `react-dnd` ou API HTML5).
    - Risques de bugs, notamment sur mobile.

- **Option B — Menu « Déplacer vers… »**
    - Plus robuste.
    - Action → ouverture d'une **Modal** → choix du dossier → validation.

### Recommandation
👉 **Option B (Menu + Modal)** pour une V1 fiable, simple à coder et compatible mobile.

### Verdict
🟠 **Moyenne** — logique BDD simple, mais UI de sélection de dossier à concevoir.

---

## 3. Feat à ajouter : CRUD complet dans l'Explorateur

### Le besoin
Renommer, supprimer et créer des fichiers/dossiers directement depuis `ExplorerView`.

### Analyse par action

#### A. Création de fichier dans un dossier
- **Actuel** : `createDocument` crée à la racine ou sans dossier cible.
- **Modification** :
    - Adapter `DocumentController.createDocument` pour accepter un paramètre optionnel `folderId`.
- **UI** :
    - Bouton **« Nouveau Fichier »** dans la toolbar de l'explorateur, utilisant l'ID du dossier courant.

#### B. Renommage (fichiers & dossiers)
- **Backend**
    - `renameFolder` existe déjà.
    - `updateDocument` (changement de titre) existe déjà.

- **UI — deux approches**
    1. **Inline editing** : double-clic → input (style Windows/Mac). Complexe en React.
    2. **Modal / Prompt** : bouton *Renommer* → popup demandant le nouveau nom.

#### C. Suppression (dossiers)
- **Backend** : `deleteFolder` existe (soft delete).

- **Sécurité — que faire du contenu ?**
    - **Option 1** : interdire la suppression d'un dossier non vide.
    - **Option 2 (recommandée)** : suppression en cascade (`is_deleted` sur tout le contenu).

#### Interface globale — Menu contextuel
Pour éviter une UI surchargée :

- Bouton **« … »** sur chaque fichier/dossier.
- Contenu du menu :
    - Ouvrir
    - Renommer
    - Déplacer
    - Supprimer

### Verdict
🟠 **Moyenne** — beaucoup de petites logiques à connecter.  
La création du composant **Menu Contextuel** est la clé.

---

## Résumé du plan d'action

Ordre logique d'implémentation :

1. **Vite fait, bien fait** : corriger la suppression dans le Dashboard (Feat 1).
2. **Mise à niveau Controller** : modifier `createDocument` pour accepter `folderId` (Feat 3A).
3. **UI — Menu Contextuel** : créer le composant « 3 points » déclenchant Renommer / Supprimer / Déplacer.

---

# I. Monétisation

Le marché de la prise de notes (**Productivity Tools**) est saturé mais très rentable.  
Les utilisateurs sont fidèles une fois leur système en place.  
Face à Notion ou Obsidian, il faut vendre **la commodité** et **la sécurité**.

Architecture cible : **React / Supabase / PWA**.

---

## 1. Modèle « Freemium » (le plus viable)

### Version gratuite — Local First
- Utilisation illimitée en local (IndexedDB).
- Création illimitée de dossiers et fichiers.
- Export Markdown.

**Pourquoi ?**
- Adoption maximale.
- Aucun coût serveur (Supabase).

### Version Pro — Cloud (~3 € à 5 € / mois)
- Synchronisation multi-appareils (**Killer Feature**).
- Sauvegarde cloud sécurisée.
- Historique de versions illimité  
  (gratuit limité aux 3 dernières versions).

---

## 2. Power Features (achat unique ou abonnement)

Fonctionnalités à forte valeur ajoutée :

- **Publication** : transformer un dossier en site web ou blog public.
- **AI Assistant** : résumer, corriger ou continuer d'écrire (OpenAI / Mistral).
- **Exports Premium** :
    - PDF stylisé avec charte graphique.
    - Export WordPress / Medium.

---

## 3. Offre « Lifetime Deal » (LTD)

Idéale pour un lancement *Indie Hacker*.

- Licence à vie pour les premiers utilisateurs (ex. : **49 € une fois**).
- **Avantage** : trésorerie immédiate.
- **Risque** : coûts Supabase sur le long terme à bien anticiper.

---

## 4. La cible (niche)

Ne pas viser tout le monde.  
Viser une niche claire pour **ZenMark** :

- **Développeurs / Techs** : Markdown, rapidité, esprit PWA.
- **Écrivains minimalistes** : environnement *Distraction Free*.

---

## Synthèse de faisabilité technique

*(À compléter : coûts, charge serveur, roadmap technique, risques)*