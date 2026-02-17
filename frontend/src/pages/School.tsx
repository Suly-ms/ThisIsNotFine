import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    profile?: {
        searchType: string;
        searchStatus: string;
        studyDomain?: string;
        bio?: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
        cvPath?: string;
    }
}

export default function School() {
    const { name } = useParams<{ name: string }>();
    usePageTitle(`Établissement - ${name}`);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!name) return;
        fetch(`/api/schools/${encodeURIComponent(name)}/students`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setStudents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Impossible de trouver l\'établissement.');
                setLoading(false);
            });
    }, [name]);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div className="container">{error}</div>;

    return (
        <main>
            <div className="container">
                <h2>Étudiants de {name}</h2>
                <br />
                <ul className="student-list">
                    {students.length === 0 ? (
                        <li>Aucun étudiant trouvé pour cet établissement.</li>
                    ) : (
                        students.map(student => (
                            <li key={student.id}>
                                <details>
                                    <summary style={{ fontSize: '1.2em' }}>
                                        <strong>{student.firstName} {student.lastName}</strong>
                                        {' - '}{student.profile ? student.profile.searchType : 'N/A'} ({student.profile ? student.profile.searchStatus : 'N/A'})
                                    </summary>
                                    <div style={{ marginLeft: 40, marginTop: 10, marginBottom: 5, fontSize: '1.15em' }}>
                                        <p><strong>Domaine d'études:</strong> {student.profile?.studyDomain || 'Non renseigné'}</p>

                                        {student.profile?.bio && (
                                            <p><strong>Bio:</strong><br /><em>{student.profile.bio}</em></p>
                                        )}

                                        <p><strong>Liens:</strong></p>
                                        <ul>
                                            {student.profile?.cvPath && (
                                                <li><a href={student.profile.cvPath} target="_blank" style={{ color: '#d32f2f', fontWeight: 'bold' }}>📄 Télécharger le CV</a></li>
                                            )}
                                            {student.profile?.linkedin && (
                                                <li><a href={student.profile.linkedin} target="_blank">LinkedIn</a></li>
                                            )}
                                            {student.profile?.github && (
                                                <li><a href={student.profile.github} target="_blank">GitHub</a></li>
                                            )}
                                            {student.profile?.portfolio && (
                                                <li><a href={student.profile.portfolio} target="_blank">Portfolio</a></li>
                                            )}
                                        </ul>
                                    </div>
                                </details>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </main>
    );
}
