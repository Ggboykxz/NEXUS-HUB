'use client';

import { useState, useEffect } from 'react';

export default function CookiesPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div>
            <h1>Politique relative aux Cookies</h1>
            <p className="lead">Dernière mise à jour : {lastUpdated}</p>

            <h2>1. Qu'est-ce qu'un cookie ?</h2>
            <p>
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou mobile) lors de la visite d'un site ou de la consultation d'une publicité. Il a pour but de collecter des informations relatives à votre navigation et de vous adresser des services adaptés à votre terminal.
            </p>

            <h2>2. Pourquoi utilisons-nous des cookies ?</h2>
            <p>
                Sur NexusHub, nous utilisons des cookies pour :
            </p>
            <ul>
                <li><strong>Assurer le bon fonctionnement du site :</strong> Mémoriser vos informations de connexion et sécuriser votre accès.</li>
                <li><strong>Améliorer votre expérience :</strong> Retenir vos préférences de langue et vos réglages du lecteur (mode Webtoon vs BD).</li>
                <li><strong>Mesurer l'audience :</strong> Comprendre comment vous utilisez la plateforme pour améliorer nos services.</li>
                <li><strong>Proposer des contenus personnalisés :</strong> Recommander des œuvres basées sur vos lectures précédentes.</li>
            </ul>

            <h2>3. Vos choix concernant les cookies</h2>
            <p>
                L'enregistrement d'un cookie dans un terminal est subordonné à la volonté de l'utilisateur. Vous pouvez à tout moment modifier vos choix via les paramètres de votre navigateur ou via notre panneau de gestion des cookies (bientôt disponible).
            </p>

            <h2>4. Types de cookies utilisés</h2>
            <div className="grid gap-6">
                <div className="p-4 bg-muted/50 rounded-xl border">
                    <h3 className="mt-0">Cookies strictement nécessaires</h3>
                    <p className="mb-0 text-sm">Indispensables pour naviguer sur le site et utiliser ses fonctionnalités (ex: accès au panier, espace artiste).</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border">
                    <h3 className="mt-0">Cookies de performance</h3>
                    <p className="mb-0 text-sm">Collectent des informations sur la manière dont les visiteurs utilisent le site (ex: pages les plus consultées).</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border">
                    <h3 className="mt-0">Cookies de fonctionnalité</h3>
                    <p className="mb-0 text-sm">Permettent au site de mémoriser vos choix (ex: votre nom d'utilisateur, la langue choisie).</p>
                </div>
            </div>

            <h2>5. Durée de conservation</h2>
            <p>
                Les cookies sont conservés pour une durée maximale de 13 mois conformément aux recommandations de la CNIL et des autorités de protection des données africaines.
            </p>

            <h2>6. Contact</h2>
            <p>
                Pour toute question sur notre politique de gestion des cookies, contactez-nous à <a href="mailto:privacy@nexushub.com">privacy@nexushub.com</a>.
            </p>
        </div>
    );
}
