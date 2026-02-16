# NexusHub

NexusHub est une plateforme panafricaine de lecture en ligne et de mise en valeur des artistes graphiques et narratifs (dessinateurs, scénaristes, coloristes, illustrateurs, auteurs BD, webtoonistes...). L’objectif est de devenir le hub créatif africain, un lieu où professionnels et amateurs peuvent publier, lire, échanger et vivre de leur art.

## Pour commencer

Tout d'abord, lancez le serveur de développement :

```bash
npm run dev
```

Ouvrez [http://localhost:9002](http://localhost:9002) avec votre navigateur pour voir le résultat.

Vous pouvez commencer à modifier la page d'accueil en modifiant `src/app/page.tsx`. La page se met à jour automatiquement au fur et à mesure que vous modifiez le fichier.

## Journal des Modifications

Pour un suivi détaillé de toutes les modifications apportées au projet, veuillez consulter le fichier [FEEDBACK.md](./FEEDBACK.md).

## Pile Technologique

*   **Framework :** [Next.js](https://nextjs.org/) (avec App Router)
*   **UI :** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
*   **Style :** [Tailwind CSS](https://tailwindcss.com/)
*   **Composants UI :** [ShadCN UI](https://ui.shadcn.com/)
*   **IA Générative :** [Genkit](https://firebase.google.com/docs/genkit)
*   **Icônes :** [Lucide React](https://lucide.dev/guide/react)

## Structure du Projet

*   `src/app` : Contient toutes les routes, pages et mises en page.
    *   `(app)` : Routes principales de l'application qui partagent la mise en page standard (`Header`, `Footer`).
    *   `(auth)` : Routes liées à l'authentification (`/login`, `/signup`).
    *   `read` : Vue de lecture pour les histoires.
*   `src/components` : Composants React réutilisables.
    *   `common` : Composants à l'échelle du site comme `Header` et `Footer`.
    *   `ui` : Composants ShadCN UI.
    *   `icons` : Composants d'icônes SVG personnalisés.
*   `src/lib` : Contient les bibliothèques, les assistants et les données.
    *   `data.ts` : Données factices pour l'application.
    *   `navigation.ts` : Définit les liens de navigation.
    *   `placeholder-images.json` : Gère les données des images de substitution.
    *   `utils.ts` : Fonctions utilitaires.
*   `src/ai` : Contient les flux et la configuration de Genkit AI.
*   `public` : Ressources statiques.

## Feuille de Route (Roadmap)

Le développement de la plateforme suivra les phases suivantes, conformément au cahier des charges :

### Phase 1 – MVP (6 mois)
*   Inscription des utilisateurs et création des profils artistes.
*   Publication des œuvres et module de lecture en ligne.
*   Système de commentaires et statistiques de base.

### Phase 2 – Communauté (6 à 8 mois)
*   Développement des forums communautaires.
*   Mise en place du suivi d'artistes et des notifications.
*   Création des classements (likes, vues).
*   Intégration du système de dons et des publicités.

### Phase 3 – Monétisation (12 mois)
*   Lancement de la monnaie virtuelle (AfriCoins).
*   Mise en place des abonnements premium.
*   Création de la boutique de produits dérivés (goodies).
*   Développement de partenariats avec des éditeurs.

## En savoir plus

Pour en savoir plus sur les technologies utilisées dans ce projet, consultez les ressources suivantes :

*   [Documentation Next.js](https://nextjs.org/docs) - découvrez les fonctionnalités et l'API de Next.js.
*   [Documentation React](https://react.dev/) - découvrez React.
*   [Documentation Tailwind CSS](https://tailwindcss.com/docs) - découvrez Tailwind CSS.
*   [Documentation ShadCN UI](https://ui.shadcn.com/docs) - découvrez les composants ShadCN.
*   [Documentation Genkit](https://firebase.google.com/docs/genkit) - découvrez Genkit pour les fonctionnalités d'IA.
