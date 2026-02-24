
import { redirect } from 'next/navigation';

/**
 * Route neutralisée pour résoudre le conflit de parallélisme Next.js.
 * Redirige vers /webtoon-hub au sein du groupe (app).
 */
export default function WebtoonRootRedirect() {
  redirect('/webtoon-hub');
}
