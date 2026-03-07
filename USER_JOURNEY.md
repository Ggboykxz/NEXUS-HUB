# Parcours Utilisateur NexusHub

Ce document détaille les flux de navigation et les interactions clés pour chaque type d'utilisateur sur la plateforme NexusHub.

## 1. Flux Commun (Onboarding)
- **Découverte** : Consultation de la page d'accueil (`/`), des nouveautés (`/new-releases`) et des classements (`/rankings`).
- **Inscription/Connexion** : Création de compte sécurisée via Email ou Google. 
- **Choix de la Destinée** : Sélection obligatoire du rôle (Lecteur ou Artiste) pour personnaliser l'interface.
- **Initialisation** : Création atomique du profil Firestore et redirection automatique.

## 2. Le Parcours Lecteur (Voyageur)
### Exploration
- **Recherche Avancée** : Utilisation du moteur de recherche (`/search`) avec historique et support vocal.
- **Navigation par Genre** : Filtrage thématique (`/genre/[slug]`).
- **Recommandations** : Section "Pour Toi" basée sur l'historique de lecture.

### Lecture
- **Le Lecteur Magique** : Interface immersive avec barre de progression, mode Webtoon (scroll) ou BD (pages).
- **Gestion de Bibliothèque** : Suivi automatique de la progression (0-100%) dans `/library`.
- **Lecture Augmentée** : Utilisation de l'IA pour résumer les chapitres précédents ou expliquer des éléments culturels.

### Interaction & Économie
- **Soutien** : Likes, favoris et dons directs en AfriCoins.
- **Achat** : Acquisition de packs d'AfriCoins via Mobile Money ou Carte dans `/africoins`.
- **Communauté** : Participation aux débats sur `/forums` et adhésion aux `/clubs` de lecture.

## 3. Le Parcours Artiste (Créateur)
### Gestion de Projet
- **L'Atelier** : Tableau de bord centralisé (`/dashboard/creations`) pour piloter ses séries.
- **Soumission** : Flux de création d'œuvre en 3 étapes (Métadonnées, Format, Couverture).
- **Publication de Chapitres** : Upload de planches, compression automatique et gestion du statut (Brouillon / Programmé / Publié).

### Outils Avancés
- **AI Studio** : Assistance à la création (Storyboard, Palettes textiles, Analyse de rythme).
- **World Building** : Prise de notes persistante sur l'univers et les personnages.
- **Analytics** : Suivi des vues, de l'engagement et de la rétention par planche.

### Monétisation
- **Contenu Premium** : Mise en place de péages en AfriCoins sur certains chapitres.
- **Retraits** : Configuration du mode de paiement (Momo/Banque) et suivi des virements dans les paramètres.

## 4. Le Parcours Admin (Gardien)
- **Modération** : Traitement de la file des signalements (Reports).
- **Curations** : Gestion des mises en avant et des Originals.
- **Validation Pro** : Revue éditoriale des artistes Draft pour promotion au rang Pro.
