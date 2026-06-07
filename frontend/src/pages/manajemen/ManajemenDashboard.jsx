import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Package, TrendingUp, ShoppingBag, Truck, ArrowUpRight, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const ManajemenDashboard = () => {
    const [stats, setStats] = useState({ 
        sales: {total_sales: 0, total_transactions: 0}, 
        inwards: {total_inwards: 0},
        trend: []
    });
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reports');
                setStats(res.data);
            } catch (error) {
                console.error("Gagal mengambil statistik", error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                    <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                    <p className="text-primary-600 font-bold">
                        Rp {Number(payload[0].value).toLocaleString('id-ID')}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Layout>
            <div className="mb-10 flex justify-between items-end animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Utama</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Ringkasan aktivitas dan performa toko hari ini.</p>
                </div>
                <div className="hidden md:flex items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Activity className="text-primary-500 mr-2 animate-pulse" size={18} />
                    <span className="text-sm font-bold text-slate-700">Sistem Online & Stabil</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1 */}
                <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover-scale group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <TrendingUp size={28} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                +12% <ArrowUpRight size={12} className="ml-1" />
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Penjualan</p>
                        <p className="text-3xl font-extrabold text-slate-800">
                            Rp {Number(stats.sales.total_sales || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover-scale group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                <ShoppingBag size={28} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Transaksi</p>
                        <p className="text-3xl font-extrabold text-slate-800">
                            {stats.sales.total_transactions || 0} <span className="text-lg text-slate-400 font-medium ml-1">Nota</span>
                        </p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover-scale group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                <Truck size={28} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Barang Masuk</p>
                        <p className="text-3xl font-extrabold text-slate-800">
                            {stats.inwards.total_inwards || 0} <span className="text-lg text-slate-400 font-medium ml-1">Faktur</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Grafik Penjualan */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Grafik Tren Penjualan</h3>
                    <p className="text-sm text-slate-500">Performa penjualan berdasarkan data transaksi terakhir.</p>
                </div>
                <div className="h-80 w-full">
                    {stats.trend && stats.trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12}}
                                    tickFormatter={(value) => `Rp${value / 1000}k`}
                                />
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#4f46e5" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorSales)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Belum ada data transaksi yang cukup untuk ditampilkan.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl shadow-2xl shadow-primary-500/20 text-white animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/20 rounded-full mix-blend-overlay filter blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10 p-10 md:p-14 text-center flex flex-col md:flex-row items-center justify-between">
                    <div className="text-left mb-6 md:mb-0 md:mr-8 max-w-2xl">
                        <h3 className="text-3xl font-bold mb-3 tracking-tight">Pusat Kendali Operasional</h3>
                        <p className="text-primary-100 text-lg leading-relaxed font-light">
                            Gunakan panel di sebelah kiri untuk mengatur inventaris, mengelola karyawan, membuat surat permintaan (Purchase Request) ke supplier, dan menganalisis laporan.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
                            <Package className="text-white" size={48} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ManajemenDashboard;
