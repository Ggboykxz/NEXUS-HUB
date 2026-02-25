# NexusHub — Fichier de Contexte & Règles Projet

Ce document sert de guide de référence pour le développement de NexusHub afin d'assurer la stabilité de l'architecture et le respect des choix techniques majeurs.

## 🚨 RÈGLES DE ROUTAGE (CRITIQUE)
- **HIÉRARCHIE DES LAYOUTS** :
    - `src/app/layout.tsx` : **Root Layout** (Technique). Contient `<html>`, `<body>` et les `Providers`. AUCUN Header/Footer ici.
    - `src/app/(app)/layout.tsx` : **App Layout** (Visuel). Contient le `Header` et le `Footer`.
- **INTERDICTION STRICTE D'INCLUSION** : Ne JAMAIS inclure les fichiers suivants dans les blocs `<changes>` car ils sont redondants et causent des erreurs de "parallel pages". Leur suppression manuelle par l'utilisateur doit être respectée :
    - `src/app/page.tsx` (Doublon de `src/app/(app)/page.tsx`)
    - `src/app/webtoon-hub/page.tsx` (Doublon de `src/app/(app)/webtoon-hub/page.tsx`)
- **STRUCTURE CENTRALISÉE** : Toute la logique de navigation et les pages publiques résident exclusivement dans le groupe de routes `src/app/(app)/`.
- **LECTURE MAGIQUE** : Les routes de lecture sont consolidées sous `/read/[id]` ou `/webtoon-hub/[slug]/[chapter]`.

## 🛠 PILE TECHNIQUE & ARCHITECTURE (v4.2.0)
- **Framework** : Next.js 15+ (App Router).
- **Base de données** : Firestore. 
    - Structure cible : `users/{uid}/library/{storyId}` pour les progressions et `users/{uid}/subscriptions/{artistId}` pour les abonnements.
- **Schéma UserProfile** : Inclut `@slug` unique, rôles (Elite, Translator), stats de lecture et streak.
- **IA** : Genkit 1.x pour l'Atelier Éditorial, le Studio de Traduction et l'Aide à la Lecture.
- **Mobile** : Support PWA complet (manifest.json, icons, service worker).

## 🌍 IDENTITÉ & VISION
- **Focus** : Narration visuelle africaine et production propre (NexusHub Studios).
- **Multilingue** : Support étendu (Français, Anglais, Swahili, Hausa, Amharique, Arabe).
- **Économie** : Système AfriCoins participatif avec missions de traduction.

## 🎨 DESIGN SYSTEM
- **Composants** : ShadCN UI.
- **Style** : Tailwind CSS avec thème Gold/Dark (Variables HSL).
- **Icônes** : Lucide React uniquement.

---
*Note : Ce fichier doit être consulté avant chaque modification structurelle importante pour éviter la régression du routage.*