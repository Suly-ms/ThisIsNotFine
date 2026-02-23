/**
 * Point d'entrée de l'application React.
 * Monte le composant principal <App /> sur la racine du DOM.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
