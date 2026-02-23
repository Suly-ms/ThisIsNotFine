/**
 * Page de connexion.
 * Permet aux utilisateurs existants (étudiants, recruteurs ou admins) 
 * de s'authentifier pour accéder aux sections protégées.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Login() {
    usePageTitle('Connexion');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { checkAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                await res.json();
                await checkAuth();
                navigate('/search');
            } else {
                const text = await res.text();
                setError(text || "Erreur de connexion");
            }
        } catch (err) {
            console.error(err);
            setError('Erreur de connexion');
        }
    };

    return (
        <main>
            <div className="container">
                <h2>Connexion</h2>
                {error && <div className="error-alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Mot de passe:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Se connecter</button>
                </form>
            </div>
        </main>
    );
}
