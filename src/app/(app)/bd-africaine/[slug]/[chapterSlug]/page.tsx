'use client';

import WebtoonChapterPage from '../../../webtoon/[slug]/[chapterSlug]/page';

/**
 * Réutilise le composant ReaderPage consolidé pour les BD Africaines.
 * Unifie l'expérience de lecture sous une interface magique unique centralisée dans (app).
 */
export default function BdAfricaineReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  return <WebtoonChapterPage params={props.params} />;
}
