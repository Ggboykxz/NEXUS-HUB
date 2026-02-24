import { redirect } from 'next/navigation';

/**
 * Neutralisation de la route racine au profit de /webtoon-hub.
 */
export default async function WebtoonChapterRedirect(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = await props.params;
  redirect(`/webtoon-hub/${slug}/${chapterSlug}`);
}
