import { redirect } from 'next/navigation';

/**
 * Route neutralisée au profit de webtoon-hub pour éviter les erreurs Next.js.
 */
export default function AppWebtoonGroupRedirect() {
  redirect('/webtoon-hub');
}
