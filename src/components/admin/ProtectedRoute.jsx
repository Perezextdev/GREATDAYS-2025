import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
    const { isAdmin, loading } = useAuth();
    const location = useLocation();

    console.log('[ProtectedRoute] Render. loading:', loading, 'isAdmin:', isAdmin);

    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => {
                setShowFallback(true);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    if (loading) {
        console.log('[ProtectedRoute] Showing loading spinner');
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-gray-500">Verifying access...</p>
                    {showFallback && (
                        <button
                            onClick={() => window.location.href = '/admin/login'}
                            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                        >
                            Taking too long? Click here to login
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        console.log('[ProtectedRoute] Not admin, redirecting to login');
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    console.log('[ProtectedRoute] Admin access granted, rendering Outlet');
    return <Outlet />;
}
