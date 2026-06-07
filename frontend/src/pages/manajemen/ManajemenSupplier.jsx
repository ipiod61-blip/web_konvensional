import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Truck, Plus, Search, Edit2, Trash2, X, Save, History, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

const ManajemenSupplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    const fetchAudit = async () => {
        try {
            const res = await api.get('/audit-logs/suppliers');
            setAuditLogs(res.data || []);
            setIsHistoryOpen(true);
        } catch (error) {
            toast.error('Gagal mengambil riwayat audit');
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: ''
    });

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data);
        } catch (error) {
            toast.error('Gagal mengambil data supplier');
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = suppliers.filter(sup => 
        sup.name.toLowerCase().includes(search.toLowerCase()) ||
        sup.kode_supplier.toLowerCase().includes(search.toLowerCase()) ||
        (sup.address && sup.address.toLowerCase().includes(search.toLowerCase()))
    );

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                address: item.address,
                phone: item.phone
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', address: '', phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/suppliers/${editingItem.id}`, formData);
                toast.success('Data supplier berhasil diperbarui');
            } else {
                await api.post('/suppliers', formData);
                toast.success('Supplier baru berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data supplier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus supplier ini? (Data akan disembunyikan / Soft Delete)')) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast.success('Supplier berhasil dihapus');
                fetchSuppliers();
            } catch (error) {
                toast.error('Gagal menghapus supplier');
            }
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Supplier</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Kelola informasi rekanan penyuplai barang.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAudit} className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                        <History size={18} className="mr-2" /> Riwayat Aktivitas
                    </button>
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Supplier
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kode, nama, atau alamat..." 
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
                                <th className="px-6 py-4">Kode Supplier</th>
                                <th className="px-6 py-4">Nama Supplier</th>
                                <th className="px-6 py-4">Nomor Telepon</th>
                                <th className="px-6 py-4">Alamat Lengkap</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSuppliers.map((sup) => (
                                <tr key={sup.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{sup.kode_supplier}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{sup.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{sup.phone || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{sup.address || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => openModal(sup)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(sup.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data supplier yang ditemukan.
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
                                {editingItem ? 'Edit Supplier' : 'Tambah Supplier Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="supplierForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Perusahaan/Supplier</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Lengkap</label>
                                    <textarea 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm min-h-[100px]"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    ></textarea>
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
                                form="supplierForm"
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
                            <h3 className="text-xl font-bold text-slate-800">History Audit Supplier</h3>
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
                                        <p className="text-xs font-bold text-slate-800">Supplier #{log.record_id}</p>
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

export default ManajemenSupplier;
