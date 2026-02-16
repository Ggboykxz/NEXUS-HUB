# Journal des Modifications

Ce document retrace l'ensemble des modifications et améliorations apportées au projet NexusHub.

## Conception Initiale et Structuration

- **Mise à jour de la Documentation (`README.md`)**:
    - Intégration de la vision du projet et de la feuille de route (Roadmap) issues du cahier des charges.
    - Ajout de détails sur la structure du projet et la pile technologique (Next.js, Tailwind, ShadCN, Genkit).

## Design et Expérience Utilisateur (UX/UI)

- **Refonte Visuelle Complète**:
    - Intégration d'un nouveau design basé sur une maquette HTML fournie, avec un style "afro-futuriste / minimaliste / chaleureux".
    - Mise à jour de la palette de couleurs (`globals.css`) pour utiliser des tons or, brun, et des nuances chaudes.
    - Ajustement des polices pour utiliser "Playfair Display" pour les titres et "Plus Jakarta Sans" pour le corps du texte.
    - Uniformisation des arrondis (`border-radius`) pour un design plus net et cohérent.

- **Améliorations de l'En-tête (`Header`)**:
    - **Header Rétractable**: L'en-tête se réduit en hauteur lors du défilement de la page pour maximiser l'espace de lecture.
    - **Barre de Recherche Interactive**: Remplacement de l'icône statique par une barre de recherche animée, adaptée pour les ordinateurs et les appareils mobiles.
    - **Agencement Adaptatif**:
        - Meilleur centrage des liens de navigation sur grand écran.
        - Suppression du lien "Accueil" redondant (le logo servant déjà de lien).
        - Pour les utilisateurs non authentifiés, affichage des boutons "Publier", "Se connecter", et "S'inscrire" à la place des icônes de profil et de notifications.

- **Micro-interactions**:
    - **Animation des Boutons**: Ajout d'une animation subtile de "dessin de bordure" au survol des boutons pour une meilleure réactivité visuelle.

## Fonctionnalités (Phase 1 - MVP)

- **Système d'Inscription (Simulation)**:
    - Mise en place des formulaires d'inscription (`/signup`) et de connexion (`/login`).
    - Utilisation de `react-hook-form` et `zod` pour une gestion de formulaire moderne avec validation des entrées en temps réel.
    - Ajout d'une option sur le formulaire d'inscription pour choisir entre un compte "Lecteur" et un compte "Artiste", conformément au cahier des charges.


