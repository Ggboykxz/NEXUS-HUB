# NexusHub — Fichier de Contexte & Règles Projet

Ce document sert de guide de référence pour le développement de NexusHub afin d'assurer la stabilité de l'architecture et le respect des choix techniques majeurs.

## 🚨 RÈGLES DE ROUTAGE (MISES À JOUR v4.2.0)
- **LOGIQUE DE ROUTAGE HYBRIDE** :
    - `src/app/page.tsx` : **Homepage unique**. Située à la racine. Elle gère le rendu conditionnel (Landing vs Dashboard utilisateur). Doit inclure manuellement le Header et le Footer.
    - `src/app/(app)/webtoon-hub/page.tsx` : **Hub principal**. Situé dans le groupe `(app)` pour bénéficier du layout automatique.
- **INTERDICTION STRICTE** : Ne JAMAIS recréer ou mentionner les doublons suivants dans les blocs `<changes>` :
    - `src/app/(app)/page.tsx` (Conflit avec la racine)
    - `src/app/webtoon-hub/page.tsx` (Conflit avec le groupe (app))
- **LAYOUTS** : 
    - `src/app/layout.tsx` : Root Layout technique (Providers, HTML/Body). Pas de Header/Footer ici.
    - `src/app/(app)/layout.tsx` : Layout visuel partagé. Contient le Header et le Footer.

## 🛠 PILE TECHNIQUE & ARCHITECTURE
- **Framework** : Next.js 15+ (App Router).
- **Base de données** : Firestore (v4.2.0). 
    - Structure Sub-collections : 
        - `users/{uid}/library/{storyId}`
        - `users/{uid}/subscriptions/{artistId}`
        - `stories/{storyId}/likes/{userId}`
        - `stories/{storyId}/chapters/{chapterId}/comments/{commentId}`
- **Schéma UserProfile** : Inclut `@slug` unique, rôles (Elite, Translator), stats de lecture et streak.
- **IA** : Genkit 1.x pour l'AI Studio, le Studio de Traduction et l'Aide à la Lecture Augmentée.

## 🌍 IDENTITÉ & VISION
- **Focus** : Narration visuelle africaine.
- **Multilingue** : Support étendu (Français, Anglais, Swahili, Hausa, Amharique, Arabe).
- **Économie** : Système AfriCoins participatif.

---
*Note : Ce fichier doit être consulté avant chaque modification structurelle importante.*