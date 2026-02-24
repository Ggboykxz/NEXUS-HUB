import { redirect } from 'next/navigation';

/**
 * Route neutralisée pour résoudre le conflit de parallélisme.
 * Redirige vers /webtoon-hub.
 */
export default function WebtoonRootRedirect() {
  redirect('/webtoon-hub');
}
