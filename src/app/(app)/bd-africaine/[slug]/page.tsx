'use client';

import { use } from 'react';
import StoryDetailPage from '../../webtoon/[slug]/page';

/**
 * Réutilise le composant StoryDetailPage pour les BD Africaines.
 * La logique de détection du format est gérée par le composant partagé.
 */
export default function BdAfricaineDetailPage(props: { params: Promise<{ slug: string }> }) {
  return <StoryDetailPage params={props.params} />;
}
