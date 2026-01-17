1. Feat à corriger : Option de suppression sur les fichiers récents (Dashboard)
   Le constat : Actuellement, votre composant DashboardView affiche les cartes des documents, mais l'interaction principale (le clic) ouvre le document. Il manque un bouton dédié (ex: une icône poubelle) pour supprimer sans ouvrir.
   Analyse Technique :
* Backend/Controller : La fonction DocumentController.deleteDocument(id) existe déjà et fonctionne (utilisée dans la Sidebar). Aucune modification nécessaire ici.
* Frontend (UI) : Il faut modifier le JSX de la carte du document dans DashboardView.
* Point de vigilance (Le piège classique) : Le "Click Bubbling". Si on met un bouton supprimer dans la carte cliquable, cliquer sur la poubelle risque d'ouvrir le document en même temps.
    * Solution : Il faudra utiliser event.stopPropagation() sur le bouton de suppression pour empêcher l'ouverture du document.
      Verdict : ✅ Très Facile. C'est purement une modification visuelle et d'événement dans DashboardView.

