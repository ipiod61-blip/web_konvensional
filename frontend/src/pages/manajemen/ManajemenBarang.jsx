import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Package, Search, Filter, History, Trash2, Edit3, X, CheckCircle, AlertTriangle, Clock, User, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ManajemenBarang = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [merkFilter, setMerkFilter] = useState('');

    // Modals state
    const [editModal, setEditModal] = useState({ isOpen: false, item: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [historyModal, setHistoryModal] = useState({ isOpen: false, data: [] });
    const [createModal, setCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', merk: '', kategori: '', price: '' });

    const [loading, setLoading] = useState(false);

    const safeParse = (str) => {
        if (!str) return null;
        try { return JSON.parse(str); } catch (e) { return null; }
    };

    const fetchData = async () => {
        try {
            const resItems = await api.get('/items');
            setItems(resItems.data);
        } catch (error) {
            toast.error('Gagal mengambil data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/audit-logs/items');
            setHistoryModal({ isOpen: true, data: res.data });
        } catch (error) {
            toast.error('Gagal mengambil riwayat');
        }
    };

    const categories = [...new Set(items.map(i => i.kategori).filter(Boolean))];
    const merks = [...new Set(items.map(i => i.merk).filter(Boolean))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.kode_barang.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !catFilter || item.kategori === catFilter;
        const matchesMerk = !merkFilter || item.merk === merkFilter;
        return matchesSearch && matchesCat && matchesMerk;
    });

    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/items/${editModal.item.id}`, { price: editModal.item.price });
            toast.success('Harga barang berhasil diperbarui');
            setEditModal({ isOpen: false, item: null });
            fetchData();
        } catch (error) {
            toast.error('Gagal memperbarui harga');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/items', formData);
            toast.success('Barang baru berhasil ditambahkan');
            setCreateModal(false);
            setFormData({ name: '', merk: '', kategori: '', price: '' });
            fetchData();
        } catch (error) {
            toast.error('Gagal menambahkan barang');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/items/${deleteModal.id}`);
            toast.success('Barang berhasil dihapus (Soft Delete)');
            setDeleteModal({ isOpen: false, id: null, name: '' });
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus barang');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Manajemen Barang</h1>
                    <p className="text-slate-500 text-sm">Kelola harga jual dan pantau stok inventaris.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchHistory}
                        className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                    >
                        <History size={18} className="mr-2" /> Riwayat Aktivitas
                    </button>
                    <button
                        onClick={() => setCreateModal(true)}
                        className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Barang
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text" placeholder="Cari kode atau nama barang..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none font-medium">
                        <option value="">Semua Kategori</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={merkFilter} onChange={(e) => setMerkFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none font-medium">
                        <option value="">Semua Merk</option>
                        {merks.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Kode Barang</th>
                                <th className="px-6 py-4">Nama Barang</th>
                                <th className="px-6 py-4">Merk / Kategori</th>
                                <th className="px-6 py-4">Stok</th>
                                <th className="px-6 py-4">Harga Jual</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600">{item.kode_barang}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{item.merk || '-'}</span>
                                            <span className="text-[10px] text-slate-400">{item.kategori}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${item.stock < 10 ? 'text-rose-500' : 'text-slate-600'}`}>{item.stock}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-emerald-600">Rp {Number(item.price).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setEditModal({ isOpen: true, item: { ...item } })}
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Ubah Harga"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.name })}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Barang"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (Restriction: Only Price) */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Ubah Harga Barang</h3>
                            <button onClick={() => setEditModal({ isOpen: false, item: null })} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdatePrice} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 opacity-60">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Nama Barang</label>
                                    <input type="text" readOnly className="w-full px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm" value={editModal.item.name} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Kode</label>
                                    <input type="text" readOnly className="w-full px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm" value={editModal.item.kode_barang} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Harga Jual Baru (Rp)</label>
                                <input
                                    type="number" required autoFocus
                                    className="w-full px-5 py-4 bg-primary-50 border-2 border-primary-100 rounded-2xl text-2xl font-black text-primary-700 outline-none focus:border-primary-500"
                                    value={editModal.item.price}
                                    onChange={(e) => setEditModal({ ...editModal, item: { ...editModal.item, price: e.target.value } })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditModal({ isOpen: false, item: null })} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 transition-all">
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Barang?</h3>
                            <p className="text-slate-500 text-sm mb-8">Anda akan menghapus <span className="font-bold text-slate-700">"{deleteModal.name}"</span>. Data ini akan disembunyikan (Soft Delete).</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })} className="flex-1 py-3 font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button onClick={handleDelete} disabled={loading} className="flex-1 py-3 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all">
                                    {loading ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Riwayat Perubahan Barang</h3>
                            <button onClick={() => setHistoryModal({ isOpen: false, data: [] })} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {historyModal.data.map((log) => (
                                <div key={log.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                                        }`}>
                                        {log.action === 'CREATE' ? <CheckCircle size={20} /> : log.action === 'UPDATE' ? <Edit3 size={20} /> : <Trash2 size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-500">{log.action}</span>
                                            <span className="text-[10px] text-slate-400 flex items-center"><Clock size={10} className="mr-1" /> {log.waktu}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">Barang ID #{log.record_id}</p>
                                        <p className="text-xs text-slate-500 flex items-center mt-1"><User size={10} className="mr-1" /> Oleh: {log.pelaksana}</p>
                                        {log.action === 'UPDATE' && (
                                            <div className="mt-2 text-[10px] bg-white p-2 rounded-lg border border-slate-100 font-mono text-slate-400">
                                                Old Price: {safeParse(log.old_data)?.price || '-'} → New Price: {safeParse(log.new_data)?.price || '-'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {historyModal.data.length === 0 && <p className="text-center py-10 text-slate-400">Belum ada riwayat tercatat.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Tambah Barang Baru</h3>
                            <button onClick={() => setCreateModal(false)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Barang</label>
                                <input type="text" required placeholder="Cth: Semen Tiga Roda 50kg" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Merk</label>
                                    <input type="text" required placeholder="Cth: Tiga Roda" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.merk} onChange={(e) => setFormData({ ...formData, merk: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Kategori</label>
                                    <input type="text" required placeholder="Cth: Semen" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Harga Jual (Rp)</label>
                                <input type="number" required className="w-full px-5 py-4 bg-primary-50 border-2 border-primary-100 rounded-2xl text-2xl font-black text-primary-700 outline-none focus:border-primary-500" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setCreateModal(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 transition-all">
                                    {loading ? 'Menyimpan...' : 'Tambah Barang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ManajemenBarang;
