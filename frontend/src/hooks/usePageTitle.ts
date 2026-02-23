/**
 * Hook personnalisé pour mettre à jour le titre de la page (onglet du navigateur).
 */
import { useEffect } from 'react';

export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = `${title} | This Is (Not) Fine`;
    }, [title]);
}
