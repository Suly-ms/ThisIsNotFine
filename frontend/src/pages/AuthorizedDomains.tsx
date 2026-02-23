/**
 * Page "Domaines Autorisés".
 * Liste tous les noms de domaine liés aux universités ou écoles
 * qui sont acceptés lors de l'inscription étudiant.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function AuthorizedDomains() {
    usePageTitle('Domaines Autorisés');
    const [domains, setDomains] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/domains')
            .then(res => res.json())
            .then(data => {
                setDomains(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredDomains = domains.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <main>
            <div className="container">
                <h2>Domaines Autorisés</h2>
                <p>Pour garantir que seuls les étudiants peuvent s'inscrire, nous limitons l'inscription aux adresses email des établissements suivants :</p>

                <input
                    type="text"
                    placeholder="Rechercher un domaine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '100%', marginBottom: '20px', marginTop: '10px' }}
                />

                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <ul className="student-list">
                        {filteredDomains.map(domain => (
                            <li key={domain} style={{ padding: 10 }}>@{domain}</li>
                        ))}
                        {filteredDomains.length === 0 && <p>Aucun domaine trouvé.</p>}
                    </ul>
                )}

                <div style={{ marginTop: 20 }}>
                    <Link to="/signup">Retour à l'inscription</Link>
                </div>
            </div>
        </main>
    );
}
