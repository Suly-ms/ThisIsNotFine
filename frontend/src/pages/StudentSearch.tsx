import { useState, useEffect } from 'react';

interface Profile {
    bio: string;
    studyDomain: string;
    searchStatus: string;
    searchType: string;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    profile?: Profile;
    school?: { name: string };
}

export default function StudentSearch() {
    const [students, setStudents] = useState<User[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const searchStudents = (searchTerm: string) => {
        setLoading(true);
        fetch(`/api/students?q=${encodeURIComponent(searchTerm)}`)
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        searchStudents('');
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchStudents(query);
    };

    return (
        <main>
            <div className="container">
                <h2>Rechercher un étudiant</h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Nom, compétence, domaine..."
                        style={{ flex: 1 }}
                    />
                    <button type="submit">Rechercher</button>
                </form>

                {loading ? <p>Chargement...</p> : (
                    <div className="results">
                        {students.length === 0 && <p>Aucun étudiant trouvé.</p>}
                        <ul className="student-list">
                            {students.map(student => (
                                <li key={student.id}>
                                    <strong>{student.firstName} {student.lastName}</strong>
                                    {student.school && <span style={{ color: '#666', marginLeft: '10px' }}>({student.school.name})</span>}
                                    <br />
                                    {student.profile && (
                                        <>
                                            <span style={{ fontStyle: 'italic' }}>{student.profile.searchStatus} ({student.profile.searchType})</span>
                                            <p style={{ margin: '5px 0' }}>{student.profile.bio}</p>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                Domaine: {student.profile.studyDomain || 'Non renseigné'}
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}
