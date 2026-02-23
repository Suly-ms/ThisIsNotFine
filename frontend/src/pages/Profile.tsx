/**
 * Page de gestion du profil utilisateur.
 * Affiche et permet l'édition dynamique des informations de l'étudiant 
 * (bio, liens, CV) ou de l'entreprise. Gère aussi le mot de passe 
 * et la suppression de compte.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

interface StudentProfile {
    searchType: string;
    searchStatus: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    studyDomain?: string;
    bio?: string;
    cvPath?: string;
}

export default function Profile() {
    usePageTitle('Mon Profil');
    const { user, checkAuth } = useAuth();
    const [profile, setProfile] = useState<StudentProfile>({
        searchType: 'Stage',
        searchStatus: 'En recherche'
    });
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);


    useEffect(() => {
        if (user) {
            if (user.userType === 'COMPANY' && user.companyProfile) {
                setCompanyName(user.companyProfile.name || '');
                setCompanyWebsite(user.companyProfile.website || '');
                setCompanyDescription(user.companyProfile.description || '');
            } else if (user.profile) {
                setProfile(user.profile as StudentProfile);
            }
        }
        setLoading(false);
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: 'Enregistrement...', type: 'success' });

        const formData = new FormData();

        if (user?.userType === 'COMPANY') {
            formData.append('companyName', companyName);
            formData.append('companyWebsite', companyWebsite);
            formData.append('companyDescription', companyDescription);
        } else {
            Object.entries(profile).forEach(([key, value]) => {
                if (value && key !== 'cvPath') formData.append(key, value);
            });

            const fileInput = (document.getElementById('cv') as HTMLInputElement)?.files?.[0];
            if (fileInput) {
                formData.append('cv', fileInput);
            }
        }

        try {
            const res = await fetch('/api/me/profile', {
                method: 'PUT',
                body: user?.userType === 'COMPANY' ? JSON.stringify({
                    companyName, companyWebsite, companyDescription
                }) : formData,
                headers: user?.userType === 'COMPANY' ? { 'Content-Type': 'application/json' } : undefined
            });
            if (res.ok) {
                setMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
                checkAuth();
            } else {
                setMessage({ text: 'Erreur lors de la mise à jour.', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Erreur serveur.', type: 'error' });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'Les nouveaux mots de passe ne correspondent pas.', type: 'error' });
            return;
        }

        try {
            const res = await fetch('/api/me/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const text = await res.text();
            if (res.ok) {
                setPasswordMessage({ text: text, type: 'success' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ text: text, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setPasswordMessage({ text: 'Erreur serveur.', type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Êtes-vous SÛR de vouloir supprimer votre compte ? \nToutes vos données seront effacées définitivement.")) return;

        try {
            const res = await fetch('/api/me/profile', { method: 'DELETE' });
            if (res.ok) {
                alert("Votre compte a été supprimé.");
                window.location.href = '/';
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur serveur.");
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <main>
            <div className="container">
                <h2>Mon Profil {user?.userType === 'COMPANY' ? '(Entreprise)' : '(Étudiant)'}</h2>
                <form onSubmit={handleProfileUpdate}>

                    {user?.userType === 'COMPANY' ? (
                        <>
                            <label htmlFor="companyName">Nom de l'entreprise:</label>
                            <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required />

                            <label htmlFor="companyWebsite">Site Web:</label>
                            <input type="url" id="companyWebsite" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://..." />

                            <label htmlFor="companyDescription">Description:</label>
                            <textarea id="companyDescription" value={companyDescription} onChange={e => setCompanyDescription(e.target.value)} rows={4} required></textarea>
                        </>
                    ) : (
                        <>
                            <label htmlFor="searchType">Je recherche:</label>
                            <select id="searchType" value={profile.searchType} onChange={e => setProfile({ ...profile, searchType: e.target.value })}>
                                <option value="Stage">Stage</option>
                                <option value="Alternance">Alternance</option>
                            </select>

                            <label htmlFor="searchStatus">Statut:</label>
                            <select id="searchStatus" value={profile.searchStatus} onChange={e => setProfile({ ...profile, searchStatus: e.target.value })}>
                                <option value="En recherche">En recherche</option>
                                <option value="À l'écoute">À l'écoute</option>
                                <option value="Trouvé">Trouvé</option>
                            </select>

                            <label htmlFor="studyDomain">Domaine d'études:</label>
                            <input type="text" id="studyDomain" placeholder="Ex: Informatique, Gestion..." value={profile.studyDomain || ''} onChange={e => setProfile({ ...profile, studyDomain: e.target.value })} />

                            <label htmlFor="linkedin">LinkedIn:</label>
                            <input type="url" id="linkedin" placeholder="https://linkedin.com/in/..." value={profile.linkedin || ''} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} />

                            <label htmlFor="github">GitHub:</label>
                            <input type="url" id="github" placeholder="https://github.com/..." value={profile.github || ''} onChange={e => setProfile({ ...profile, github: e.target.value })} />

                            <label htmlFor="portfolio">Portfolio / Site Web:</label>
                            <input type="url" id="portfolio" placeholder="https://mon-portfolio.com" value={profile.portfolio || ''} onChange={e => setProfile({ ...profile, portfolio: e.target.value })} />

                            <label htmlFor="bio">Ma description (Bio):</label>
                            <textarea id="bio" rows={4} placeholder="Parlez de vous..." value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })}></textarea>
                            <br /><br />

                            <label htmlFor="cv">Mon CV (PDF uniquement):</label>
                            <input type="file" id="cv" accept="application/pdf" />
                            <br /><br />
                        </>
                    )}

                    <button type="submit">Enregistrer</button>
                </form>
                {message && <div style={{ marginTop: 10, color: message.type === 'success' ? 'green' : 'red' }}>{message.text}</div>}

                <br />

                <div className="container">
                    <h3>Sécurité</h3>
                    <form onSubmit={handlePasswordChange}>
                        <label htmlFor="currentPassword">Mot de passe actuel:</label>
                        <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />

                        <label htmlFor="newPassword">Nouveau mot de passe:</label>
                        <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={3} required />

                        <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe:</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={3} required />

                        <button type="submit">Changer le mot de passe</button>
                    </form>
                    {passwordMessage && <div style={{ marginTop: 10, color: passwordMessage.type === 'success' ? 'green' : 'red' }}>{passwordMessage.text}</div>}
                </div>

                <br />
                <div className="container">
                    <hr style={{ margin: '30px 0', border: 0, borderTop: '1px solid #ccc' }} />
                    <div style={{ textAlign: 'right' }}>
                        <h3>Zone de Danger</h3>
                        <p style={{ fontSize: '0.9em', color: '#666' }}>Cette action est irréversible.</p>
                        <button onClick={handleDeleteAccount} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: 5 }}>
                            Supprimer mon compte définitivement
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
