import { Link } from 'react-router-dom';

export default function SearchLanding() {
    return (
        <main>
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Que recherchez-vous ?</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
                    <Link to="/map" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ border: '2px solid #333', padding: '20px', width: '250px', cursor: 'pointer', backgroundColor: '#fff' }}>
                            <h3 style={{ marginTop: 0 }}>Un Établissement</h3>
                            <p>Voir la carte des écoles et leurs étudiants.</p>
                            <span style={{ fontSize: '2rem' }}>🏫</span>
                        </div>
                    </Link>

                    <Link to="/students" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ border: '2px solid #333', padding: '20px', width: '250px', cursor: 'pointer', backgroundColor: '#fff' }}>
                            <h3 style={{ marginTop: 0 }}>Un Étudiant</h3>
                            <p>Rechercher un profil par nom ou compétence.</p>
                            <span style={{ fontSize: '2rem' }}>🎓</span>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
