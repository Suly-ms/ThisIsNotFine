/**
 * Formulaire de création d'école (Interface Admin).
 * Utilise l'API Nominatim/OpenStreetMap pour suggérer 
 * les villes et leurs coordonnées géographiques.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function CreateSchool({ onSuccess }: { onSuccess?: () => void }) {
    usePageTitle('Créer un établissement');
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [city, setCity] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]); // New state for suggestions
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCity(val);
        if (val.length > 2) {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}`);
                const data = await res.json();
                setSuggestions(data || []); // Update suggestions state
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectCity = (s: any) => {
        setCity(s.display_name);
        setLatitude(s.lat);
        setLongitude(s.lon);
        setSuggestions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/schools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, latitude, longitude })
            });
            if (res.ok) {
                setMessage({ text: 'Établissement créé !', type: 'success' });
                if (onSuccess) {
                    onSuccess();
                    setName('');
                    setCity('');
                    setLatitude('');
                    setLongitude('');
                } else {
                    setTimeout(() => navigate('/'), 1500);
                }
            } else {
                setMessage({ text: 'Erreur lors de la création', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Erreur serveur', type: 'error' });
        }
    };

    return (
        <main>
            <div className="container">
                <h2>Créer un établissement</h2>
                {message && <div style={{ color: message.type === 'success' ? 'green' : 'red', marginBottom: 10 }}>{message.text}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Nom de l'établissement:</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required />

                    <label htmlFor="city">Ville (Auto-complétion):</label>
                    <div style={{ position: 'relative' }}>
                        <input type="text" id="city" value={city} onChange={handleCityChange} placeholder="Tapez une ville..." autoComplete="off" />
                        {suggestions.length > 0 && (
                            <ul className="suggestions-list" style={{ display: 'block' }}>
                                {suggestions.map((s, i) => (
                                    <li key={i} onClick={() => handleSelectCity(s)}>
                                        {s.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ display: 'none' }}>
                        <input type="text" id="latitude" value={latitude} readOnly />
                        <input type="text" id="longitude" value={longitude} readOnly />
                    </div>

                    <button type="submit">Créer</button>
                </form>
            </div>
        </main>
    );
}
