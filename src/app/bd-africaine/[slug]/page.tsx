'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function BdSlugRedirect(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  const router = useRouter();

  useEffect(() => {
    // Redirection pour éviter le conflit de routes racine vs (app)
    router.replace(`/bd-africaine/${slug}`);
  }, [slug, router]);

  return null;
}
