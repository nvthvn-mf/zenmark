1. Feat à corriger : Option de suppression sur les fichiers récents (Dashboard)
   Le constat : Actuellement, votre composant DashboardView affiche les cartes des documents, mais l'interaction principale (le clic) ouvre le document. Il manque un bouton dédié (ex: une icône poubelle) pour supprimer sans ouvrir.
   Analyse Technique :
* Backend/Controller : La fonction DocumentController.deleteDocument(id) existe déjà et fonctionne (utilisée dans la Sidebar). Aucune modification nécessaire ici.
* Frontend (UI) : Il faut modifier le JSX de la carte du document dans DashboardView.
* Point de vigilance (Le piège classique) : Le "Click Bubbling". Si on met un bouton supprimer dans la carte cliquable, cliquer sur la poubelle risque d'ouvrir le document en même temps.
    * Solution : Il faudra utiliser event.stopPropagation() sur le bouton de suppression pour empêcher l'ouverture du document.
      Verdict : ✅ Très Facile. C'est purement une modification visuelle et d'événement dans DashboardView.

2. Feat à ajouter : Fonction de déplacement (Explorer)
   Le besoin : Pouvoir prendre un fichier (ou un dossier) et le changer de dossier.
   Analyse Technique :
* Backend/Base de données :
    * Pour les Fichiers : La table documents a déjà la colonne folder_id. Nous avons déjà créé la méthode DocumentController.moveDocument. C'est prêt.
    * Pour les Dossiers : La table folders a la colonne parent_id. Il faudra ajouter une méthode FolderController.moveFolder(folderId, targetFolderId).
* Frontend (UI) - Le défi UX : Comment l'utilisateur va-t-il déplacer le fichier ?
    * Option A (Drag & Drop) : Très intuitif mais techniquement lourd à implémenter (librairies comme react-dnd ou API HTML5 native). Risque de bugs sur mobile.
    * Option B (Menu "Déplacer vers...") : Plus robuste. On clique sur "Déplacer", une petite fenêtre (Modal) s'ouvre, on choisit le dossier de destination dans une liste, et on valide.
      Recommandation : Pour une V1 fiable, je recommande l'Option B (Menu + Modal). C'est plus simple à coder et fonctionne parfaitement sur mobile.
      Verdict : 🟠 Moyenne. La logique BDD est simple, mais créer une interface de sélection de dossier (Modal) demande un peu de travail UI.

3. Feat à ajouter : CRUD complet dans l'Explorateur
   Le besoin : Renommer, Supprimer, Créer (fichiers/dossiers) directement depuis la vue ExplorerView.
   Analyse par action :
* A. Création de fichier dans un dossier
    * Actuel : createDocument crée toujours à la racine ou ne prend pas d'argument dossier.
    * Modification : Il faut modifier DocumentController.createDocument pour accepter un paramètre optionnel folderId.
    * UI : Ajouter un bouton "Nouveau Fichier" dans la barre d'outils de l'explorateur qui utilise l'ID du dossier courant.
* B. Renommage (Fichiers & Dossiers)
    * Backend : renameFolder existe déjà. updateDocument (pour changer le titre) existe déjà.
    * UI : Le défi est l'interface. Deux écoles :
        1. Inline editing : Le texte devient un champ input quand on double-clique (style Windows/Mac). Complexe à gérer en React.
        2. Modal/Prompt : Un bouton "Renommer", une popup demande le nouveau nom. Plus simple.
* C. Suppression (Dossiers)
    * Backend : deleteFolder existe (soft delete).
    * Sécurité : Si on supprime un dossier, que deviennent les fichiers dedans ?
        * Option 1 : On interdit de supprimer un dossier non vide.
        * Option 2 (Recommandée) : Suppression en cascade (si je supprime le dossier "Projet", tout son contenu est marqué is_deleted aussi). Cela demande une petite logique supplémentaire côté SQL ou Controller.
* L'Interface Globale (Menu Contextuel)
    * Pour ne pas surcharger l'interface avec 50 boutons par fichier, la solution standard est un Menu Contextuel (bouton "..." sur chaque carte).
    * Ce menu contiendra : Ouvrir, Renommer, Déplacer, Supprimer.
      Verdict : 🟠 Moyenne. Beaucoup de petites logiques à connecter. La création du composant "Menu Contextuel" (Dropdown) sera la clé pour rendre ça propre.

