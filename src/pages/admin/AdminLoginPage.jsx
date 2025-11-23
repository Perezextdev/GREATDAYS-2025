// src/pages/admin/AdminLoginPage.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[AdminLoginPage] handleSubmit called');
        setLoading(true);
        setError("");
        try {
            console.log('[AdminLoginPage] calling login()');
            await login(email, password);
            console.log('[AdminLoginPage] login successful, navigating to dashboard');
            navigate("/admin/dashboard");
        } catch (err) {
            console.error('[AdminLoginPage] login failed:', err);
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/30">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Sign in to the Admin Portal</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="admin@greatdays.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all" />
                                    <div className="absolute inset-0 text-white opacity-0 peer-checked:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <Link
                                to="/admin/signup"
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Don't have an account? Sign up
                            </Link>
                        </div>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={async () => {
                                    console.log('Testing raw fetch...');
                                    const start = Date.now();
                                    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&head=true`;
                                    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

                                    try {
                                        const response = await fetch(url, {
                                            headers: {
                                                'apikey': key,
                                                'Authorization': `Bearer ${key}`
                                            }
                                        });
                                        const duration = Date.now() - start;
                                        console.log('Raw fetch result:', { status: response.status, duration });
                                        alert(`Raw fetch finished in ${duration}ms. Status: ${response.status}`);
                                    } catch (err) {
                                        const duration = Date.now() - start;
                                        console.error('Raw fetch error:', err);
                                        alert(`Raw fetch failed in ${duration}ms. Error: ${err.message}`);
                                    }
                                }}
                                className="text-xs text-green-500 underline"
                            >
                                Test Connectivity (Raw Fetch)
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Protected by Great Days Security Systems
                </p>
            </motion.div>
        </div>
    );
}
