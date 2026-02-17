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
                // We could just call checkAuth(), but to be sure we have the user immediately:
                await res.json(); // Consume body
                // We need to update the context with this user.
                // However, checkAuth() should do it. Let's make sure checkAuth waits for the fetch.
                await checkAuth();

                // CRITICAL: The user might still be null if checkAuth failed silently or race condition?
                // Actually, res.json() consumes the body. checkAuth makes a NEW request.
                // Ah, in the specific case of 401/403, we return text in the error block.
                // But if successful, we get JSON. checkAuth also gets JSON from /api/me.

                navigate('/search');
            } else {
                // If 401/403, we might get text or json depending on our backend implementation.
                // Our backend sends `res.status(401).send('Utilisateur non trouvé')` (text)
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
