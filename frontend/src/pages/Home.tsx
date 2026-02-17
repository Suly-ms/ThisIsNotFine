import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Home() {
    usePageTitle('Accueil');
    const { user, loading } = useAuth();

    if (loading) return <div>Chargement...</div>;

    return (
        <main>
            <div className="container">
                {user ? (
                    <>
                        <h2>Bienvenue, {user.firstName} !</h2>
                        <p>Heureux de vous revoir sur la plateforme des étudiants.</p>
                        <div style={{ marginTop: '20px' }}>
                            <Link to="/search">
                                <button>Rechercher un établissement</button>
                            </Link>
                            <br /><br />
                            <Link to="/profile">
                                <button>Mon Profil</button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Bienvenue sur This Is (Not) Fine</h2>
                        <p>La plateforme pour retrouver les étudiants de votre école.</p>
                        <div style={{ marginTop: '20px' }}>
                            <Link to="/login">
                                <button>Se connecter</button>
                            </Link>
                            <br /><br />
                            <Link to="/signup">
                                <button>S'inscrire</button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
