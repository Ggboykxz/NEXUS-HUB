import { redirect } from 'next/navigation';

/**
 * Route neutralisée pour résoudre le conflit de parallélisme Next.js.
 * L'univers Webtoon est désormais centralisé dans src/app/(app)/webtoon-hub.
 */
export default function WebtoonRootRedirect() {
  redirect('/webtoon-hub');
}
