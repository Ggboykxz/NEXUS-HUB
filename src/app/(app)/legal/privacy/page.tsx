'use client';

import { useState, useEffect } from 'react';

export default function PrivacyPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div>
            <h1>Politique de Confidentialité</h1>
            <p className="lead">Dernière mise à jour : {lastUpdated}</p>

            <h2>1. Introduction</h2>
            <p>
                NexusHub ("nous", "notre") s'engage à protéger la vie privée de ses utilisateurs. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme (le "Service").
            </p>

            <h2>2. Informations que nous collectons</h2>
            <p>Nous pouvons collecter des informations vous concernant de différentes manières :</p>
            <ul>
                <li>
                    <strong>Informations personnelles identifiables :</strong> Telles que votre nom, votre adresse email, que vous nous fournissez volontairement lorsque vous vous inscrivez.
                </li>
                <li>
                    <strong>Données d'utilisation :</strong> Informations que votre navigateur envoie automatiquement chaque fois que vous visitez le Service, comme votre adresse IP, le type de navigateur, les pages visitées.
                </li>
            </ul>

            <h2>3. Utilisation de vos informations</h2>
            <p>
                Avoir des informations précises sur vous nous permet de vous offrir une expérience fluide, efficace et personnalisée. Spécifiquement, nous pouvons utiliser les informations collectées pour :
            </p>
            <ul>
                <li>Créer et gérer votre compte.</li>
                <li>Vous envoyer un email de confirmation.</li>
                <li>Vous notifier des mises à jour sur la plateforme.</li>
                <li>Analyser l'utilisation et les tendances pour améliorer votre expérience.</li>
            </ul>

            <h2>4. Sécurité de vos informations</h2>
            <p>
                Nous utilisons des mesures de sécurité administratives, techniques et physiques pour aider à protéger vos informations personnelles. Bien que nous ayons pris des mesures raisonnables pour sécuriser les informations personnelles que vous nous fournissez, sachez que malgré nos efforts, aucune mesure de sécurité n'est parfaite ou impénétrable.
            </p>

            <h2>5. Cookies</h2>
            <p>
                Nous pouvons utiliser des cookies pour aider à personnaliser le Service et améliorer votre expérience. En utilisant le Service, vous acceptez notre utilisation des cookies.
            </p>

            <h2>6. Droits des utilisateurs</h2>
            <p>
                Vous avez le droit de consulter, de modifier ou de supprimer les informations personnelles que nous avons collectées. Pour exercer ce droit, veuillez nous contacter aux coordonnées ci-dessous.
            </p>

            <h2>7. Contactez-nous</h2>
            <p>
                Si vous avez des questions ou des commentaires sur cette Politique de Confidentialité, veuillez nous contacter à <a href="mailto:privacy@nexushub.com">privacy@nexushub.com</a>.
            </p>
        </div>
    );
}
