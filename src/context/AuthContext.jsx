import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

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
                .eq('is_active', true)
                .single();

            if (error || !data) {
                console.warn('User is authenticated but not an active admin');
                setIsAdmin(false);
                setAdminProfile(null);
            } else {
                setAdminProfile(data);
                setIsAdmin(true);

                // Update last login
                await supabase
                    .from('admin_users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.id);
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
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAdminProfile(null);
        setIsAdmin(false);
    };

    const value = {
        user,
        adminProfile,
        isAdmin,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
