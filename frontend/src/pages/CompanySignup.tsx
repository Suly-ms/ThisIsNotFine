import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function CompanySignup() {
    usePageTitle('Inscription Entreprise');
    const navigate = useNavigate();

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password,
                    userType: 'COMPANY',
                    companyName,
                    companyWebsite,
                    companyDescription
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || await res.text());
            }
        } catch (err) {
            console.error(err);
            setError('Erreur lors de l\'inscription');
        }
    };

    return (
        <main>
            <div className="container">
                <h2>Inscription Entreprise</h2>
                <p>Créez un compte pour votre entreprise afin de rechercher des stagiaires. Votre compte devra être validé par un administrateur.</p>

                {error && <div className="error-alert">{error}</div>}
                {success && <div className="success-alert" style={{ color: 'green', fontWeight: 'bold' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <h3>Contact</h3>
                    <label htmlFor="firstname">Prénom:</label>
                    <input type="text" id="firstname" value={firstname} onChange={e => setFirstname(e.target.value)} required />

                    <label htmlFor="lastname">Nom:</label>
                    <input type="text" id="lastname" value={lastname} onChange={e => setLastname(e.target.value)} required />

                    <label htmlFor="email">Email professionnel:</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />

                    <label htmlFor="password">Mot de passe:</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />

                    <label htmlFor="confirmPassword">Confirmer le mot de passe:</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

                    <h3>Entreprise</h3>
                    <label htmlFor="companyName">Nom de l'entreprise:</label>
                    <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required />

                    <label htmlFor="companyWebsite">Site Web:</label>
                    <input type="url" id="companyWebsite" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://..." />

                    <label htmlFor="companyDescription">Description:</label>
                    <textarea id="companyDescription" value={companyDescription} onChange={e => setCompanyDescription(e.target.value)} rows={4} placeholder="Décrivez votre activité..." required></textarea>

                    <button type="submit">S'inscrire</button>
                </form>
            </div>
        </main>
    );
}
