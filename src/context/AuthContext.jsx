import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [token, setToken] = useState(null);

    // Initialize session from localStorage
    useEffect(() => {
        const initSession = async () => {
            console.log('[AuthContext] Initializing manual session...');
            try {
                const storedSession = localStorage.getItem('sb_session');
                if (storedSession) {
                    const session = JSON.parse(storedSession);
                    // Basic expiry check (optional, but good practice)
                    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
                        console.warn('[AuthContext] Session expired');
                        localStorage.removeItem('sb_session');
                    } else {
                        console.log('[AuthContext] Restoring session from storage');
                        // Sync with Supabase client
                        const { error } = await supabase.auth.setSession({
                            access_token: session.access_token,
                            refresh_token: session.refresh_token
                        });

                        if (error) console.warn('[AuthContext] Error syncing session with Supabase client:', error);
                        else console.log('[AuthContext] Synced session with Supabase client');

                        setToken(session.access_token);
                        setUser(session.user);
                        const userRole = session.user.user_metadata?.role || 'viewer';
                        setRole(userRole);
                        setIsAdmin(true); // Assuming if they have a valid session they are admin/user

                        // Fetch profile manually if needed, or just use metadata
                        setAdminProfile({
                            id: session.user.id,
                            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                            role: userRole,
                            email: session.user.email
                        });
                    }
                } else {
                    console.log('[AuthContext] No session found in storage');
                }
            } catch (err) {
                console.error('[AuthContext] Error restoring session:', err);
            } finally {
                setLoading(false);
            }
        };

        initSession();
    }, []);

    const login = async (email, password) => {
        console.log('[AuthContext] login called for:', email);

        try {
            console.log('[AuthContext] Attempting raw fetch login...');
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[AuthContext] Raw login error:', data);
                throw new Error(data.error_description || data.msg || 'Login failed');
            }

            console.log('[AuthContext] Raw login success');

            // Store session manually
            const session = {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
                user: data.user
            };

            localStorage.setItem('sb_session', JSON.stringify(session));

            // Sync with Supabase client
            await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token
            });

            setToken(data.access_token);
            setUser(data.user);
            const userRole = data.user.user_metadata?.role || 'viewer';
            setRole(userRole);
            setIsAdmin(true);

            setAdminProfile({
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                role: userRole,
                email: data.user.email
            });

            return session;

        } catch (err) {
            console.error('[AuthContext] login exception:', err);
            throw err;
        }
    };

    const signup = async (email, password, fullName, userRole = 'super_admin') => {
        console.log('[AuthContext] signup called for:', email);

        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: {
                        full_name: fullName,
                        role: userRole
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[AuthContext] Signup error:', data);
                throw new Error(data.error_description || data.msg || 'Signup failed');
            }

            console.log('[AuthContext] Signup success:', data);

            // If auto-confirm is enabled, we might get a session back. 
            // If not, the user needs to confirm email. 
            // For this app, we assume we might want to auto-login or just let them login.
            // The AdminSignupPage redirects to login after success, so we don't need to set session here necessarily.

            return data;
        } catch (err) {
            console.error('[AuthContext] signup exception:', err);
            throw err;
        }
    };

    const logout = async () => {
        localStorage.removeItem('sb_session');
        setUser(null);
        setRole(null);
        setIsAdmin(false);
        setAdminProfile(null);
        setToken(null);
    };

    const hasPermission = (requiredPermission) => {
        if (!role) return false;
        if (role === 'super_admin') return true;

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
        adminProfile,
        loading,
        token, // Expose token for other hooks
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
