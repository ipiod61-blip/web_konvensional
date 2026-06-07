import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Settings, Search, Clock, User, Database } from 'lucide-react';
import { toast } from 'sonner';

const ManajemenAudit = () => {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        try {
            const res = await api.get('/audit-logs');
            setLogs(res.data);
        } catch (error) {
            toast.error('Gagal mengambil data audit trail');
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.table_name.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        (log.pelaksana && log.pelaksana.toLowerCase().includes(search.toLowerCase()))
    );

    const getActionColor = (action) => {
        switch(action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Audit Trail</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Rekaman riwayat aktivitas dan perubahan data pada sistem.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="flex justify-between items-center mb-6 gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari berdasarkan tabel, aksi, atau pelaksana..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Pelaksana</th>
                                <th className="px-6 py-4">Aksi</th>
                                <th className="px-6 py-4">Tabel</th>
                                <th className="px-6 py-4">ID Record</th>
                                <th className="px-6 py-4">Detail Perubahan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-600">
                                            <Clock size={14} className="mr-2 text-slate-400" />
                                            {log.waktu}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center font-medium text-slate-800">
                                            <User size={14} className="mr-2 text-slate-400" />
                                            {log.pelaksana || 'Sistem'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-600 capitalize">
                                            <Database size={14} className="mr-2 text-slate-400" />
                                            {log.table_name.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">#{log.record_id}</td>
                                    <td className="px-6 py-4">
                                        <details className="text-xs text-slate-500 cursor-pointer max-w-xs">
                                            <summary className="font-medium text-primary-600 hover:text-primary-700">Lihat Data JSON</summary>
                                            <div className="mt-2 p-2 bg-slate-900 text-slate-300 rounded-lg overflow-x-auto">
                                                {log.old_data && (
                                                    <div className="mb-2">
                                                        <span className="text-rose-400 font-bold block mb-1">Old Data:</span>
                                                        <pre>{JSON.stringify(log.old_data, null, 2)}</pre>
                                                    </div>
                                                )}
                                                {log.new_data && (
                                                    <div>
                                                        <span className="text-emerald-400 font-bold block mb-1">New Data:</span>
                                                        <pre>{JSON.stringify(log.new_data, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data log yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ManajemenAudit;
