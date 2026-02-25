# NexusHub — Fichier de Contexte & Règles Projet

Ce document sert de guide de référence pour le développement de NexusHub afin d'assurer la stabilité de l'architecture et le respect des choix techniques majeurs.

## 🚨 RÈGLES DE ROUTAGE (CRITIQUE)
- **INTERDICTION STRICTE** : Ne JAMAIS inclure les fichiers `src/app/page.tsx` et `src/app/webtoon-hub/page.tsx` dans les propositions de modifications. Ces fichiers causent des erreurs de "parallel pages" et doivent rester supprimés.
- **STRUCTURE CENTRALISÉE** : Toute la logique de navigation et les pages publiques résident exclusivement dans le groupe de routes `src/app/(app)/`.
- **LECTURE MAGIQUE** : Les routes de lecture sont consolidées sous `/read/[id]`.

## 🛠 PILE TECHNIQUE & ARCHITECTURE
- **Framework** : Next.js 15+ (App Router).
- **Base de données** : Firestore v4.2.0 (Structure de sous-collections pour `library` et `subscriptions`).
- **Schéma UserProfile** : Inclut @slug unique, rôles (Elite, Translator), stats de lecture et streak.
- **IA** : Genkit 1.x pour l'Atelier Éditorial, le Studio de Traduction et l'Aide à la Lecture.
- **Mobile** : Support PWA complet.

## 🌍 IDENTITÉ & VISION
- **Focus** : Narration visuelle africaine.
- **Multilingue** : Support étendu (Hausa, Amharique, Arabe).
- **Économie** : Système AfriCoins participatif.

## 🎨 DESIGN SYSTEM
- **Composants** : ShadCN UI.
- **Style** : Tailwind CSS avec thème Gold/Dark (Variables HSL).
- **Icônes** : Lucide React uniquement.

---
*Note : Ce fichier doit être consulté avant chaque modification structurelle importante pour éviter la régression du routage.*
