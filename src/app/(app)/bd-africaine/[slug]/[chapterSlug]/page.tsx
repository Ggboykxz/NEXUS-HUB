'use client';

import WebtoonChapterPage from '../../../webtoon/[slug]/[chapterSlug]/page';

/**
 * Réutilise le composant ReaderPage pour les BD Africaines.
 */
export default function BdAfricaineReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  // Correction de l'appel du composant réutilisé
  return <WebtoonChapterPage params={props.params} />;
}
