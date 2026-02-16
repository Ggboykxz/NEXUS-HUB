# AfriStory Hub

AfriStory est une plateforme panafricaine de lecture en ligne et de mise en valeur des artistes graphiques et narratifs (dessinateurs, scénaristes, coloristes, illustrateurs, auteurs BD, webtoonistes...). L’objectif est de devenir le hub créatif africain, un lieu où professionnels et amateurs peuvent publier, lire, échanger et vivre de leur art.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start editing the main page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Journal des Modifications

Pour un suivi détaillé de toutes les modifications apportées au projet, veuillez consulter le fichier [FEEDBACK.md](./FEEDBACK.md).

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **UI:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit)
*   **Icons:** [Lucide React](https://lucide.dev/guide/react)

## Project Structure

*   `src/app`: Contains all the routes, pages, and layouts.
    *   `(app)`: Main application routes that share the standard layout (`Header`, `Footer`).
    *   `(auth)`: Authentication-related routes (`/login`, `/signup`).
    *   `read`: Reader view for stories.
*   `src/components`: Reusable React components.
    *   `common`: Site-wide components like `Header` and `Footer`.
    *   `ui`: ShadCN UI components.
    *   `icons`: Custom SVG icon components.
*   `src/lib`: Contains libraries, helpers, and data.
    *   `data.ts`: Mock data for the application.
    *   `navigation.ts`: Defines navigation links.
    *   `placeholder-images.json`: Manages placeholder image data.
    *   `utils.ts`: Utility functions.
*   `src/ai`: Contains Genkit AI flows and configuration.
*   `public`: Static assets.

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

## Learn More

To learn more about the technologies used in this project, check out the following resources:

*   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
*   [React Documentation](https://react.dev/) - learn about React.
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.
*   [ShadCN UI Documentation](https://ui.shadcn.com/docs) - learn about ShadCN components.
*   [Genkit Documentation](https://firebase.google.com/docs/genkit) - learn about Genkit for AI features.
