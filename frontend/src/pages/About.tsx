import { usePageTitle } from '../hooks/usePageTitle';

export default function About() {
    usePageTitle('À Propos');
    return (
        <main>
            <div className="container">
                <h2>Le Projet</h2>
                <p>
                    <strong>This Is (Not) Fine</strong> est une plateforme dédiée à connecter les étudiants en recherche d'opportunités de
                    stage avec des entreprises. Notre mission est de faciliter la mise en relation entre les talents de demain et les organisations qui
                    cherchent à les recruter.
                </p>
                <p>
                    Les étudiants peuvent s'inscrire via leur email universitaire, compléter leur profil et indiquer leurs préférences (type de stage, statut).
                    Les recruteurs peuvent ainsi découvrir des profils qualifiés simplement.
                </p>

                <h3>Infrastructure & Auto-Hébergement</h3>
                <p>
                    Ce site est fier d'être <strong>100% auto-hébergé</strong> (Self-Hosted) en France, sur une infrastructure privée indépendante des GAFAM.
                    Le serveur qui propulse ce site a les caractéristiques suivantes :
                </p>
                <ul className="hardware-list">
                    <li><strong>Processeur :</strong> Intel Core i5-6500 (3.2 GHz)</li>
                    <li><strong>Mémoire Vive :</strong> 16 Go RAM DDR4</li>
                    <li><strong>Stockage :</strong> SSD Sandisk 500 Go</li>
                    <li><strong>OS & Stack :</strong> Linux Ubuntu Server / Docker / Bun / PostgreSQL</li>
                </ul>

                <div className="legal-section" style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #ccc' }}>
                    <h2>Mentions Légales & Confidentialité</h2>

                    <h3 style={{ marginBottom: 10, fontSize: '1.2rem', color: '#333' }}>1. Éditeur et Hébergeur</h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                        Le site est édité et hébergé à titre personnel par le propriétaire du projet "This Is (Not) Fine".<br />
                        <strong>Contact :</strong> thisisnotfine-noreply@gmail.com<br />
                        <strong>Hébergement :</strong> Serveur privé situé en France (Grand Est).
                    </p>

                    <h3 style={{ marginBottom: 10, fontSize: '1.2rem', color: '#333' }}>2. Données Personnelles (RGPD)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                        Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que :
                    </p>
                    <ul className="hardware-list" style={{ listStyleType: 'square', marginLeft: 20, marginBottom: 20, paddingLeft: 20 }}>
                        <li style={{ marginBottom: 5, color: '#444' }}><strong>Données collectées :</strong> Nom, Prénom, Email, École, Liens professionnels (LinkedIn/Github).</li>
                        <li style={{ marginBottom: 5, color: '#444' }}><strong>Finalité :</strong> Gestion des comptes utilisateurs et mise en relation étudiants/entreprises.</li>
                        <li style={{ marginBottom: 5, color: '#444' }}><strong>Destinataires :</strong> Les données sont strictement confidentielles et ne sont jamais revendues à des tiers.</li>
                        <li style={{ marginBottom: 5, color: '#444' }}><strong>Durée de conservation :</strong> Les comptes inactifs depuis plus de 2 ans sont supprimés.</li>
                    </ul>

                    <h3 style={{ marginBottom: 10, fontSize: '1.2rem', color: '#333' }}>3. Vos Droits</h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                        Vous disposez d'un droit d'accès, de modification et de suppression de vos données.
                        Si vous souhaitez supprimer votre compte, veuillez nous contacter à l'adresse email ci-dessus ou via votre espace profil (fonctionnalité à venir).
                    </p>

                    <h3 style={{ marginBottom: 10, fontSize: '1.2rem', color: '#333' }}>4. Cookies</h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                        Ce site utilise uniquement des cookies "techniques" (session ID) nécessaires au fonctionnement de la connexion.
                        Aucun cookie publicitaire ou de traçage tiers (Google Analytics, Facebook Pixel, etc.) n'est utilisé.
                    </p>
                </div>
            </div>
        </main>
    );
}
