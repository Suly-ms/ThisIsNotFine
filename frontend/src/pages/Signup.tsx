import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Signup() {
    usePageTitle('Inscription');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [schoolId, setSchoolId] = useState(''); // We might need to fetch schools for dropdown, or just use ID for now
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Note: Original signup used select for schools. 
    // For MVP react migration, we might want to fetch schools list here.
    // But let's assume simple input or we fetch schools.
    // Let's implement fetching schools for the dropdown.
    const [schools, setSchools] = useState<{ id: number, name: string }[]>([]);

    useEffect(() => {
        fetch('/api/schools')
            .then(res => res.json())
            .then(data => setSchools(data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password, schoolId: parseInt(schoolId) }),
            });

            if (res.ok) {
                const data = await res.json();
                navigate('/verify-email', { state: { message: data.message, email } });
            } else {
                const text = await res.text();
                setError(text);
            }
        } catch (err) {
            console.error(err);
            setError('Erreur lors de l\'inscription');
        }
    };

    return (
        <main>
            <div className="container">
                <h2>Inscription</h2>
                {error && <div className="error-alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="firstName">Prénom:</label>
                    <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />

                    <label htmlFor="lastName">Nom:</label>
                    <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />

                    <label htmlFor="email">Email universitaire:</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <div style={{ fontSize: '0.8rem', marginBottom: 10 }}>
                        <a href="/authorized-domains" target="_blank" rel="noopener noreferrer">Voir les domaines autorisés</a>
                    </div>

                    <label htmlFor="school">Établissement:</label>
                    <select id="school" value={schoolId} onChange={e => setSchoolId(e.target.value)} required>
                        <option value="">Sélectionnez votre école</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>

                    <label htmlFor="password">Mot de passe:</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />

                    <label htmlFor="confirmPassword">Confirmer le mot de passe:</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

                    <button type="submit">S'inscrire</button>
                </form>
            </div>
        </main>
    );
}
