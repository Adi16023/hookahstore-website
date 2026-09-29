'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
    | 'wholesale_customer'
    | 'wholesale_pending'
    | 'administrator'
    | 'customer'
    | 'not_approved'
    | 'loading';

type AuthState = {
    role: UserRole;
    userId: number | null;
    emailVerified: boolean;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
};

const GUEST_STATE: AuthState   = { role: 'not_approved', userId: null, emailVerified: false, email: null, firstName: null, lastName: null };
const LOADING_STATE: AuthState = { role: 'loading',      userId: null, emailVerified: false, email: null, firstName: null, lastName: null };

type AuthContextType = AuthState & {
    refresh: () => void;
};

const AuthContext = createContext<AuthContextType>({
    ...GUEST_STATE,
    refresh: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>(LOADING_STATE);

    const fetchAuth = () => {
        fetch('/api/auth/me')
            .then((res) => {
                if (res.status === 401) {
                    setAuth(GUEST_STATE);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                setAuth({
                    role: data.role ?? 'not_approved',
                    userId: data.userId ?? null,
                    emailVerified: data.emailVerified ?? false,
                    email: data.email ?? null,
                    firstName: data.firstName ?? null,
                    lastName: data.lastName ?? null,
                });
            })
            .catch(() => setAuth(GUEST_STATE));
    };

    useEffect(() => {
        fetchAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ ...auth, refresh: fetchAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
