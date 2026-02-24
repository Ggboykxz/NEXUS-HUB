import { redirect } from 'next/navigation';

/**
 * Fichier déplacé vers /webtoon-hub pour résoudre le conflit de parallélisme.
 */
export default async function AppWebtoonChapterRedirect(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = await props.params;
  redirect(`/webtoon-hub/${slug}/${chapterSlug}`);
}
