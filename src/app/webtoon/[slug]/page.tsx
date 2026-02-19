'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function WebtoonSlugRedirect(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/webtoon/${slug}`);
  }, [slug, router]);

  return null;
}
