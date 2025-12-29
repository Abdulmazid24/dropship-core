import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            login: (user, token) => {
                localStorage.setItem('accessToken', token);
                set({ user, accessToken: token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                set({ user: null, accessToken: null, isAuthenticated: false });
            },

            setUser: (user) => {
                set({ user, isAuthenticated: true });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
