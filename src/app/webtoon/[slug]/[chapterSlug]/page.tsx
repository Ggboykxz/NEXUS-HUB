import { redirect } from 'next/navigation';

/**
 * Route neutralisée pour résoudre le conflit de parallélisme Next.js.
 * Le lecteur est désormais centralisé dans src/app/(app)/webtoon-hub/[slug]/[chapterSlug].
 */
export default async function WebtoonChapterRedirect(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = await props.params;
  redirect(`/webtoon-hub/${slug}/${chapterSlug}`);
}
