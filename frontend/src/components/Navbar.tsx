/**
 * Composant de navigation (Header).
 * Affiche les liens du menu en fonction de l'état de connexion de l'utilisateur.
 */
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
                {user ? (
                    <>
                        <Link to="/profile">Mon Profil</Link>
                        <Link to="/search">Rechercher</Link>
                        {user.admin && <Link to="/admin" style={{ color: 'red', fontWeight: 'bold' }}>Espace Admin</Link>}
                        <Link to="/about">À Propos</Link>
                        <button onClick={logout} className="btnDeconnexion" style={{ marginLeft: 'auto' }}>Déconnexion</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Connexion</Link>
                        <Link to="/signup">Étudiants</Link>
                        <Link to="/company-signup">Entreprises</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
