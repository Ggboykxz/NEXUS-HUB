
'use client';

import WebtoonChapterPage from '../../../webtoon-hub/[slug]/[chapterSlug]/page';

/**
 * Réutilise le Lecteur Magique consolidé pour les BD Africaines.
 * Unifie l'expérience de lecture sous une interface unique.
 */
export default function BdAfricaineReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  return <WebtoonChapterPage params={props.params} />;
}
