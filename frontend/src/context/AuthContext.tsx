/**
 * Contexte d'authentification global (React Context).
 * Fournit l'état de l'utilisateur connecté, l'état de chargement, 
 * et les fonctions applicatives de validation (checkAuth) et de déconnexion.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    admin: boolean;
    email: string;
    userType?: string;
    adminVerified?: boolean;
    profile?: any;
    companyProfile?: {
        name: string;
        website?: string;
        description?: string;
    } | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/logout');
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
