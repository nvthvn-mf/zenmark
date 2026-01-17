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

