import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

export default function ProtectedRoute() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // 1. Check Supabase session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setAuthenticated(false);
                setLoading(false);
                return;
            }

            // 2. Check if user exists in admin_users table
            const { data: adminUser, error } = await supabase
                .from('admin_users')
                .select('role')
                .eq('email', session.user.email)
                .single();

            if (error || !adminUser) {
                console.error('User is authenticated but not an admin');
                await supabase.auth.signOut();
                setAuthenticated(false);
            } else {
                setAuthenticated(true);
                // Update local storage role just in case
                localStorage.setItem('admin_role', adminUser.role);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

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

    return authenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/admin/login" state={{ from: location }} replace />
    );
}
