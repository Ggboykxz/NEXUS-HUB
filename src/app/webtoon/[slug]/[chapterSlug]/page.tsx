'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function WebtoonChapterRedirect(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = use(props.params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/webtoon/${slug}/${chapterSlug}`);
  }, [slug, chapterSlug, router]);

  return null;
}
