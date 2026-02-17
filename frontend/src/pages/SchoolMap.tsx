import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface School {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    _count?: {
        users: number;
    };
}


import { usePageTitle } from '../hooks/usePageTitle';

export default function Search() {
    usePageTitle('Carte des Écoles');
    const [schools, setSchools] = useState<School[]>([]);
    const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [hideEmpty, setHideEmpty] = useState(true);
    const [suggestions, setSuggestions] = useState<School[]>([]);

    useEffect(() => {
        fetch('/api/schools')
            .then(res => res.json())
            .then(data => {
                setSchools(data as School[]);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let result = schools;
        if (hideEmpty) {
            result = result.filter(s => (s._count?.users || 0) > 0);
        }
        setFilteredSchools(result);
    }, [schools, hideEmpty]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // logic to locate school or filter list?
        // Basic search just filters suggestions for now.
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            setSuggestions(schools.filter(s => s.name.toLowerCase().includes(query.toLowerCase())));
        } else {
            setSuggestions([]);
        }
    };

    return (
        <main>
            <div className="container">
                <h2>Rechercher un établissement</h2>
                <form onSubmit={handleSearch}>
                    <label htmlFor="school-search">Nom de l'établissement:</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            id="school-search"
                            value={searchQuery}
                            onChange={handleSearchInput}
                            placeholder="Ex: Epitech"
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className="suggestions-list" style={{ display: 'block' }}>
                                {suggestions.map(s => (
                                    <li key={s.id} onClick={() => window.location.href = `/school/${s.name}`}>
                                        <Link to={`/school/${s.name}`} style={{ textDecoration: 'none', color: 'inherit', border: 'none', padding: 0 }}>{s.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </form>

                <div className="filters" style={{ margin: '15px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={hideEmpty}
                            onChange={e => setHideEmpty(e.target.checked)}
                            style={{ marginRight: 10, width: 'auto' }}
                        />
                        Masquer les établissements sans étudiants
                    </label>
                </div>

                <div id="map" style={{ height: 600 }}>
                    <MapContainer center={[46.603354, 1.888334]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* We use France GeoJSON in the original, but TileLayer is easier for now. Original had NO tiles, only GeoJSON. 
                            Let's sticky to Tiles for better UX or try to fetch GeoJSON. 
                            The user code fetched github raw geojson. I'll use TileLayer for reliability + markers. */}

                        {filteredSchools.map(school => (
                            <Marker key={school.id} position={[school.latitude, school.longitude]}>
                                <Popup>
                                    <b>{school.name}</b><br />
                                    {(school._count?.users || 0) > 0 ? (
                                        <>
                                            {school._count?.users} étudiant(s)<br />
                                            <Link to={`/school/${school.name}`}>Voir les étudiants</Link>
                                        </>
                                    ) : (
                                        "Aucun étudiant inscrit"
                                    )}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </main>
    );
}
