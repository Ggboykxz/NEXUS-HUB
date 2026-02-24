
'use client';

import { use } from 'react';
import StoryDetailPage from '../../webtoon-hub/[slug]/page';

/**
 * Réutilise le composant StoryDetailPage consolidé.
 * La redirection et la logique de format sont gérées par le hub centralisé.
 */
export default function BdAfricaineDetailPage(props: { params: Promise<{ slug: string }> }) {
  return <StoryDetailPage params={props.params} />;
}
