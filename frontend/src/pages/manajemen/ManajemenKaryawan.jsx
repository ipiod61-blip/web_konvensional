import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Users, Plus, Search, Edit2, Trash2, X, Save, History, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

const ManajemenKaryawan = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    const fetchAudit = async () => {
        try {
            const res = await api.get('/audit-logs/employees');
            setAuditLogs(res.data || []);
            setIsHistoryOpen(true);
        } catch (error) {
            toast.error('Gagal mengambil riwayat audit');
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'kasir'
    });

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (error) {
            toast.error('Gagal mengambil data karyawan');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.kode_karyawan.toLowerCase().includes(search.toLowerCase()) ||
        emp.username.toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                username: item.username,
                password: '', // Don't populate password
                role: item.role
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', username: '', password: '', role: 'kasir' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                // If editing and password is empty, don't send it
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                
                await api.put(`/employees/${editingItem.id}`, payload);
                toast.success('Data karyawan berhasil diperbarui');
            } else {
                if (!formData.password) {
                    return toast.error('Password wajib diisi untuk karyawan baru');
                }
                await api.post('/employees', formData);
                toast.success('Karyawan baru berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data karyawan');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus karyawan ini? (Data akan disembunyikan / Soft Delete)')) {
            try {
                await api.delete(`/employees/${id}`);
                toast.success('Karyawan berhasil dihapus');
                fetchEmployees();
            } catch (error) {
                toast.error('Gagal menghapus karyawan');
            }
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Karyawan</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Kelola akses sistem untuk kasir dan staf manajemen.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAudit} className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                        <History size={18} className="mr-2" /> Riwayat Aktivitas
                    </button>
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Karyawan
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kode, nama, atau username..." 
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
                                <th className="px-6 py-4">Kode Karyawan</th>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Role Akses</th>
                                <th className="px-6 py-4">Tanggal Bergabung</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{emp.kode_karyawan}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{emp.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{emp.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${emp.role === 'manajemen' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(emp.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => openModal(emp)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(emp.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data karyawan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in px-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">
                                {editingItem ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="employeeForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username Login</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Password {editingItem && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                                    </label>
                                    <input 
                                        type="password"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Role Akses</label>
                                    <select 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="kasir">Kasir</option>
                                        <option value="manajemen">Manajemen (Admin)</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                form="employeeForm"
                                className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all flex items-center"
                            >
                                <Save size={16} className="mr-2" /> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Modal */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">History Audit Karyawan</h3>
                            <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {auditLogs.map(log => (
                                <div key={log.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex gap-4">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <History size={20}/>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{log.action}</span>
                                            <span className="text-[10px] text-slate-400 flex items-center"><Clock size={10} className="mr-1"/> {log.waktu}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800">Karyawan #{log.record_id}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 flex items-center"><User size={10} className="mr-1"/> Oleh: {log.pelaksana}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ManajemenKaryawan;
