import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(username, password);
            toast.success('Login berhasil! Selamat datang kembali.');
            if (user.role === 'kasir') {
                navigate('/kasir');
            } else {
                navigate('/manajemen');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login gagal. Periksa kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 mb-4 shadow-sm border border-primary-100">
                            <Building2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Toko Bakti Jaya</h2>
                        <p className="text-slate-500 text-sm">Silakan masuk untuk melanjutkan</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 text-sm transition-all duration-300 outline-none"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 text-sm transition-all duration-300 outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-primary-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Masuk
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
