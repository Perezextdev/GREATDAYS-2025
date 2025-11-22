import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    await fetchAdminProfile(session.user.email);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchAdminProfile(session.user.email);
            } else {
                setUser(null);
                setAdminProfile(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchAdminProfile = async (email) => {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                console.warn('User is authenticated but not found in admin_users');
                setIsAdmin(false);
                setAdminProfile(null);
            } else if (!data.is_active) {
                console.warn('User is authenticated but is_active is false');
                setIsAdmin(false);
                setAdminProfile(null);
            } else {
                setAdminProfile(data);
                setIsAdmin(true);

                // Update last login - wrap in try/catch to avoid blocking
                try {
                    await supabase
                        .from('admin_users')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', data.id);
                } catch (updateError) {
                    console.warn('Failed to update last_login:', updateError);
                }
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;

        if (data.user) {
            await fetchAdminProfile(data.user.email);
        }
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAdminProfile(null);
        setIsAdmin(false);
    };

    const hasPermission = (requiredRole) => {
        if (!adminProfile || !adminProfile.role) return false;
        if (adminProfile.role === 'super_admin') return true;

        // Role hierarchy or specific checks
        switch (requiredRole) {
            case 'manage_registrations':
                return ['super_admin', 'coordinator'].includes(adminProfile.role);
            case 'view_registrations':
                return ['super_admin', 'coordinator', 'support_agent', 'viewer'].includes(adminProfile.role);
            case 'manage_testimonials':
                return ['super_admin', 'coordinator'].includes(adminProfile.role);
            case 'manage_support':
                return ['super_admin', 'support_agent'].includes(adminProfile.role);
            case 'manage_badges':
                return ['super_admin', 'coordinator'].includes(adminProfile.role);
            case 'manage_settings':
                return ['super_admin'].includes(adminProfile.role);
            case 'edit_delete':
                return ['super_admin', 'coordinator'].includes(adminProfile.role); // General edit/delete permission
            default:
                return false;
        }
    };

    const value = {
        user,
        adminProfile,
        isAdmin,
        loading,
        login,
        logout,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
