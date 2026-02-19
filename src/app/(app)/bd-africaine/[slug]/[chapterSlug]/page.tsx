'use client';

import { use } from 'react';
import ReaderPage from '../../webtoon/[slug]/[chapterSlug]/page';

/**
 * Réutilise le composant ReaderPage pour les BD Africaines.
 * Le format de lecture paginé est souvent préféré pour les BD classiques.
 */
export default function BdAfricaineReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  return <ReaderPage params={props.params} />;
}
