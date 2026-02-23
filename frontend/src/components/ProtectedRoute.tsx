/**
 * Composant utilitaire pour la protection des routes.
 * Redirige l'utilisateur vers la page de connexion s'il n'est pas authentifié.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Chargement...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
