'use client';

import WebtoonChapterPage from '../../../webtoon/[slug]/[chapterSlug]/page';

/**
 * Réutilise le composant ReaderPage pour les BD Africaines.
 * Consolide l'expérience de lecture sous une interface unique et magique.
 */
export default function BdAfricaineReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  return <WebtoonChapterPage params={props.params} />;
}
