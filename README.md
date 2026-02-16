# AfriStory Hub

This is a Next.js project bootstrapped with Firebase Studio. It's a platform for showcasing African visual storytelling, including comics, webtoons, and graphic novels.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start editing the main page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

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

## Learn More

To learn more about the technologies used in this project, check out the following resources:

*   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
*   [React Documentation](https://react.dev/) - learn about React.
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.
*   [ShadCN UI Documentation](https://ui.shadcn.com/docs) - learn about ShadCN components.
*   [Genkit Documentation](https://firebase.google.com/docs/genkit) - learn about Genkit for AI features.
