import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
    const { isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-gray-500">Verifying access...</p>
                </div>
            </div>
        );
    }

    return isAdmin ? (
        <Outlet />
    ) : (
        <Navigate to="/admin/login" state={{ from: location }} replace />
    );
}
