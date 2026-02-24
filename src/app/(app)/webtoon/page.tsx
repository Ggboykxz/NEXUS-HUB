
import { redirect } from 'next/navigation';

/**
 * Route consolidée. Redirige vers webtoon-hub pour éviter les erreurs Next.js.
 */
export default function AppWebtoonRedirect() {
  redirect('/webtoon-hub');
}
