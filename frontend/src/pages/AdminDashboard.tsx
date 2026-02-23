/**
 * Tableau de bord administrateur.
 * Permet aux admins de créer des écoles, valider des entreprises 
 * en attente, et gérer les utilisateurs (bannissement, suppression).
 */
import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import CreateSchool from './CreateSchool';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    usePageTitle('Administration');
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'create-school' | 'verify-companies' | 'users'>('create-school');
    const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [banModal, setBanModal] = useState<{ userId: number | null, open: boolean }>({ userId: null, open: false });
    const [banDuration, setBanDuration] = useState('');
    const [banIndefinite, setBanIndefinite] = useState(false);

    useEffect(() => {
        if (activeTab === 'verify-companies') {
            fetchPendingCompanies();
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchPendingCompanies = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/pending-companies');
            if (res.ok) setPendingCompanies(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const verifyCompany = async (id: number) => {
        if (!confirm("Valider cette entreprise ?")) return;
        try {
            const res = await fetch(`/api/admin/verify-company/${id}`, { method: 'POST' });
            if (res.ok) {
                alert("Entreprise validée !");
                fetchPendingCompanies();
            } else {
                alert("Erreur serveur.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const rejectCompany = async (id: number) => {
        if (!confirm("Rejeter et supprimer cette demande ?")) return;
        try {
            const res = await fetch(`/api/admin/reject-company/${id}`, { method: 'POST' });
            if (res.ok) {
                alert("Entreprise rejetée.");
                fetchPendingCompanies();
            } else {
                alert("Erreur serveur.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBan = async () => {
        if (!banModal.userId) return;
        try {
            const res = await fetch(`/api/admin/users/${banModal.userId}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ durationDays: banDuration, indefinite: banIndefinite })
            });
            if (res.ok) {
                alert("Utilisateur banni.");
                setBanModal({ userId: null, open: false });
                setBanDuration('');
                setBanIndefinite(false);
                fetchUsers();
            } else {
                alert("Erreur lors du bannissement.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUnban = async (id: number) => {
        if (!confirm("Débannir cet utilisateur ?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}/unban`, { method: 'POST' });
            if (res.ok) {
                alert("Utilisateur débanni.");
                fetchUsers();
            } else {
                alert("Erreur serveur.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Êtes-vous SÛR de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Utilisateur supprimé.");
                fetchUsers();
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!user || (!user.admin && user.userType !== 'ADMIN')) return <div>Accès refusé.</div>;

    return (
        <main className="container">
            <h2>Tableau de Bord Admin</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button onClick={() => setActiveTab('create-school')} disabled={activeTab === 'create-school'}>Gestion Établissements</button>
                <button onClick={() => setActiveTab('verify-companies')} disabled={activeTab === 'verify-companies'}>Vérification Entreprises</button>
                <button onClick={() => setActiveTab('users')} disabled={activeTab === 'users'}>Utilisateurs</button>
            </div>

            <hr />

            {activeTab === 'create-school' && (
                <CreateSchool onSuccess={() => { alert('École créée !'); }} />
            )}

            {activeTab === 'verify-companies' && (
                <div>
                    <h3>Entreprises en attente</h3>
                    {loading && <p>Chargement...</p>}
                    {!loading && pendingCompanies.length === 0 && <p>Aucune demande en attente.</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {pendingCompanies.map(c => (
                            <li key={c.id} style={{ border: '1px solid #ddd', padding: 15, marginBottom: 10, borderRadius: 5 }}>
                                <strong>{c.companyProfile?.name}</strong> ({c.email})<br />
                                <small>Site: {c.companyProfile?.website} | Inscrit le: {new Date(c.createdAt).toLocaleDateString()}</small>
                                <p><em>"{c.companyProfile?.description}"</em></p>
                                <div style={{ marginTop: 10 }}>
                                    <button onClick={() => verifyCompany(c.id)} style={{ marginRight: 10, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 3, cursor: 'pointer' }}>Valider</button>
                                    <button onClick={() => rejectCompany(c.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 3, cursor: 'pointer' }}>Rejeter</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    <h3>Gestion des Utilisateurs</h3>
                    {loading && <p>Chargement...</p>}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Type</th>
                                <th>Admin</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td>{u.id}</td>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>{u.email}</td>
                                    <td>{u.userType}</td>
                                    <td>{u.admin ? 'OUI' : 'NON'}</td>
                                    <td>
                                        {u.banExpiresAt && new Date(u.banExpiresAt) > new Date() ? (
                                            <span style={{ color: 'red', fontWeight: 'bold' }}>Banni ({new Date(u.banExpiresAt).toLocaleDateString()})</span>
                                        ) : (
                                            <span style={{ color: 'green' }}>Actif</span>
                                        )}
                                    </td>
                                    <td>
                                        {!u.admin && (
                                            <>
                                                {u.banExpiresAt && new Date(u.banExpiresAt) > new Date() ? (
                                                    <button onClick={() => handleUnban(u.id)} style={{ marginRight: 5 }}>Débannir</button>
                                                ) : (
                                                    <button onClick={() => setBanModal({ userId: u.id, open: true })} style={{ marginRight: 5 }}>Bannir</button>
                                                )}
                                                <button onClick={() => handleDeleteUser(u.id)} style={{ color: 'red' }}>Supprimer</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {banModal.open && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, width: 300 }}>
                                <h4>Bannir l'utilisateur {banModal.userId}</h4>
                                <label>
                                    <input type="checkbox" checked={banIndefinite} onChange={e => setBanIndefinite(e.target.checked)} />
                                    Bannissement définitif / indéfini
                                </label>
                                {!banIndefinite && (
                                    <div style={{ marginTop: 10 }}>
                                        <label>Durée (jours):</label>
                                        <input type="number" value={banDuration} onChange={e => setBanDuration(e.target.value)} style={{ width: '100%' }} />
                                    </div>
                                )}
                                <div style={{ marginTop: 20, textAlign: 'right' }}>
                                    <button onClick={() => setBanModal({ userId: null, open: false })} style={{ marginRight: 10 }}>Annuler</button>
                                    <button onClick={handleBan} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 3 }}>Bannir</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
