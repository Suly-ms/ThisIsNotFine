import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            if (res.ok) {
                navigate('/search');
            } else {
                setError('Code invalide');
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
                <p>Un code a été envoyé à votre adresse email.</p>
                {error && <div className="error-alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="code">Code de vérification:</label>
                    <input type="text" id="code" value={code} onChange={e => setCode(e.target.value)} required />
                    <button type="submit">Vérifier</button>
                </form>
            </div>
        </main>
    );
}
