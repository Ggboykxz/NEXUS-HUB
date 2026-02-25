# NexusHub — Fichier de Contexte & Règles Projet

Ce document sert de guide de référence pour le développement de NexusHub afin d'assurer la stabilité de l'architecture et le respect des choix techniques majeurs.

## 🚨 RÈGLES DE ROUTAGE (MISES À JOUR v4.2.0)
- **LOGIQUE DE CENTRALISATION** : L'utilisateur a choisi de centraliser les pages principales à la racine du dossier `/app` pour une gestion directe.
- **ROUTES PRIORITAIRES** :
    - `src/app/page.tsx` : **Homepage unique**. Doit inclure manuellement le Header et le Footer.
    - `src/app/webtoon-hub/page.tsx` : **Hub principal**. Doit inclure manuellement le Header et le Footer.
- **INTERDICTION STRICTE** : Ne JAMAIS recréer ou mentionner `src/app/(app)/page.tsx` ou `src/app/(app)/webtoon-hub/page.tsx`. Ces fichiers ont été supprimés pour éviter les conflits de routes parallèles.
- **LAYOUTS** : 
    - `src/app/layout.tsx` reste le Root Layout technique (Providers).
    - `src/app/(app)/layout.tsx` reste le layout visuel pour les sous-pages (Header/Footer partagé).

## 🛠 PILE TECHNIQUE & ARCHITECTURE
- **Framework** : Next.js 15+ (App Router).
- **Base de données** : Firestore (v4.2.0). 
    - Structure Sub-collections : 
        - `users/{uid}/library/{storyId}` pour les progressions.
        - `users/{uid}/subscriptions/{artistId}` pour les abonnements.
        - `stories/{storyId}/chapters/{chapterId}/comments/{commentId}` pour les interactions.
- **Schéma UserProfile** : Inclut `@slug` unique, rôles (Elite, Translator), stats de lecture et streak.
- **IA** : Genkit 1.x pour l'AI Studio, le Studio de Traduction et l'Aide à la Lecture Augmentée.

## 🌍 IDENTITÉ & VISION
- **Focus** : Narration visuelle africaine et production propre (NexusHub Studios).
- **Multilingue (Phase B)** : Support étendu (Français, Anglais, Swahili, Hausa, Amharique, Arabe).
- **Économie** : Système AfriCoins participatif avec missions de traduction et parrainage.

## 🎨 DESIGN SYSTEM
- **Composants** : ShadCN UI.
- **Style** : Tailwind CSS avec thèmes Gold/Beige (Variables HSL).
- **Icônes** : Lucide React uniquement.

---
*Note : Ce fichier doit être consulté avant chaque modification structurelle importante.*
