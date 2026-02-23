/**
 * Page de Vérification d'Email.
 * Vérifie le code PIN envoyé par l'API pour activer un compte.
 * Authentifie automatiquement l'utilisateur si le code est correct.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function VerifyEmail() {
    usePageTitle('Vérification Email');
    const location = useLocation();
    const state = location.state as { message?: string; email?: string } | null;

    const [email, setEmail] = useState(state?.email || '');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            if (res.ok) {
                navigate('/search');
            } else {
                const errText = await res.text();
                setError(errText || 'Code invalide');
            }
        } catch (err) {
            console.error(err);
            setError('Erreur serveur');
        }
    };

    return (
        <main>
            <div className="container">
                <h2>Vérification Email</h2>
                {state?.message ? <p>{state.message}</p> : <p>Un code a été envoyé à votre adresse email.</p>}
                {error && <div className="error-alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />

                    <label htmlFor="code">Code de vérification:</label>
                    <input type="text" id="code" value={code} onChange={e => setCode(e.target.value)} required />
                    <button type="submit">Vérifier</button>
                </form>
            </div>
        </main>
    );
}
