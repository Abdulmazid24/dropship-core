import { useAuthStore } from '../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
