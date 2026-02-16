'use client';

import { useState, useEffect } from 'react';

export default function TermsPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div>
            <h1>Conditions d'Utilisation</h1>
            <p className="lead">Dernière mise à jour : {lastUpdated}</p>

            <h2>1. Acceptation des conditions</h2>
            <p>
                En accédant ou en utilisant la plateforme NexusHub (le "Service"), vous acceptez d'être lié par ces Conditions d'Utilisation ("Conditions"). Si vous n'êtes pas d'accord avec une partie des conditions, vous ne pouvez pas accéder au Service.
            </p>

            <h2>2. Description du Service</h2>
            <p>
                NexusHub est une plateforme panafricaine de lecture en ligne et de mise en valeur des artistes graphiques et narratifs. Elle permet aux créateurs ("Artistes") de publier leurs œuvres et aux utilisateurs ("Lecteurs") de les lire.
            </p>

            <h2>3. Comptes Utilisateurs</h2>
            <p>
                Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de la protection de votre mot de passe et de toute activité se déroulant sous votre compte. Vous acceptez de ne pas divulguer votre mot de passe à un tiers.
            </p>

            <h2>4. Contenu Utilisateur</h2>
            <p>
                En tant qu'Artiste, vous conservez tous les droits sur le contenu que vous publiez. Cependant, en publiant sur NexusHub, vous nous accordez une licence mondiale, non exclusive, et libre de droits pour héberger, afficher, et distribuer votre contenu sur la plateforme.
            </p>
            <p>
                Vous êtes seul responsable du contenu que vous publiez. Il ne doit pas enfreindre les droits d'auteur, les marques de commerce ou tout autre droit de propriété intellectuelle.
            </p>

            <h2>5. Monnaie Virtuelle (AfriCoins)</h2>
            <p>
                Les AfriCoins sont une monnaie virtuelle qui peut être achetée et utilisée sur la plateforme pour débloquer du contenu 'Premium'. Les AfriCoins n'ont aucune valeur monétaire en dehors de NexusHub et ne sont pas remboursables.
            </p>

            <h2>6. Résiliation</h2>
            <p>
                Nous pouvons résilier ou suspendre votre accès au Service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans limitation, si vous violez les Conditions.
            </p>

            <h2>7. Modifications des Conditions</h2>
            <p>
                Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer ces Conditions à tout moment. Nous fournirons un préavis d'au moins 30 jours avant que les nouvelles conditions n'entrent en vigueur.
            </p>

            <h2>8. Contactez-nous</h2>
            <p>
                Si vous avez des questions sur ces Conditions, veuillez nous contacter à <a href="mailto:legal@nexushub.com">legal@nexushub.com</a>.
            </p>
        </div>
    );
}
