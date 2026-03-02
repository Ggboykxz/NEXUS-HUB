/**
 * @fileOverview Redirection vers la route consolidée pour éviter le conflit de routage parallèle.
 * Ce fichier doit être supprimé manuellement s'il persiste après la migration.
 */
import { redirect } from 'next/navigation';

export default function RedirectDuplicatePage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = Object.assign({}, props.params);
  redirect(`/dashboard/creations/${storyId}/add-chapter`);
}
