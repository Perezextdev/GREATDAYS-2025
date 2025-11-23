import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    // Get role from user metadata
                    const userRole = session.user.user_metadata?.role || 'viewer';
                    setRole(userRole);
                    setIsAdmin(true);
                }
                setLoading(false);
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
                const userRole = session.user.user_metadata?.role || 'viewer';
                setRole(userRole);
                setIsAdmin(true);
            } else {
                setUser(null);
                setRole(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signup = async (email, password, fullName, userRole = 'super_admin') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: userRole
                }
            }
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        setIsAdmin(false);
    };

    const hasPermission = (requiredPermission) => {
        if (!role) return false;
        if (role === 'super_admin') return true;

        // Role hierarchy and permissions
        const permissions = {
            super_admin: ['manage_registrations', 'view_registrations', 'manage_testimonials', 'manage_support', 'manage_badges', 'manage_settings', 'edit_delete'],
            coordinator: ['manage_registrations', 'view_registrations', 'manage_testimonials', 'manage_badges', 'edit_delete'],
            support_agent: ['view_registrations', 'manage_support'],
            viewer: ['view_registrations']
        };

        return permissions[role]?.includes(requiredPermission) || false;
    };

    const value = {
        user,
        role,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
