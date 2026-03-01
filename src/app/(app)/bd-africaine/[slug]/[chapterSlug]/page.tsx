'use client';

import { use } from 'react';
import MagicalReaderPage from '../../../webtoon-hub/[slug]/[chapterSlug]/page';

/**
 * Page de lecture spécifique pour la BD Africaine.
 * Force le mode 'pages' par défaut pour respecter le format classique.
 */
export default function BdAfricaineReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const params = use(props.params);
  
  return (
    <MagicalReaderPage 
      params={Promise.resolve(params)} 
      defaultMode="pages" 
    />
  );
}
