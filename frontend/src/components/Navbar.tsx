import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header>
            <h1>This Is (Not) Fine</h1>
            <br />
            <nav style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link to="/">Accueil</Link>
                {/* Debug: {JSON.stringify(user)} */}
                {user ? (
                    <>
                        <Link to="/profile">Mon Profil</Link>
                        <Link to="/search">Rechercher</Link>
                        <Link to="/about">À Propos</Link>
                        {user.admin && <Link to="/create-school">Créer un établissement</Link>}
                        <button onClick={logout} className="btnDeconnexion" style={{ marginLeft: 'auto' }}>Déconnexion</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Connexion</Link>
                        <Link to="/signup">Inscription</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
