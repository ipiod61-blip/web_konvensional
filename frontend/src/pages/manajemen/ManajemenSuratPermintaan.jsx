import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { FileText, Plus, CheckCircle, Search, X, Clock, User, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ManajemenSuratPermintaan = () => {
    const [requests, setRequests] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({ supplier_id: '', items: [{ item_id: '', quantity_requested: 1 }] });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [reqRes, supRes, itemRes] = await Promise.all([
                api.get('/purchase-requests'),
                api.get('/suppliers'),
                api.get('/items')
            ]);
            setRequests(reqRes.data || []);
            setSuppliers(supRes.data || []);
            setItems(itemRes.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data');
        }
    };



    useEffect(() => { fetchData(); }, []);

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { item_id: '', quantity_requested: 1 }] });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.supplier_id) return toast.error('Pilih supplier terlebih dahulu');
            const validItems = formData.items.filter(i => i.item_id && i.quantity_requested > 0);
            if (validItems.length === 0) return toast.error('Tambahkan minimal 1 barang');

            await api.post('/purchase-requests', { supplier_id: formData.supplier_id, items: validItems });
            toast.success('Permintaan barang berhasil dibuat');
            setIsModalOpen(false);
            setFormData({ supplier_id: '', items: [{ item_id: '', quantity_requested: 1 }] });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal membuat permintaan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Permintaan Barang (PR)</h1>
                    <p className="text-slate-500 text-sm">Buat surat pesanan barang ke supplier secara resmi.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all">
                        <Plus size={18} className="mr-2" /> Buat Permintaan
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Kode PR</th>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Dibuat Oleh</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-primary-600">{req.kode_permintaan}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(req.request_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-slate-800">{req.supplier_name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                        req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        req.status === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        {req.status === 'completed' ? 'Selesai' : req.status === 'partial' ? 'Parsial' : 'Tertunda'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{req.created_by_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Buat Permintaan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Buat Purchase Request (PR)</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pilih Supplier</label>
                                <select 
                                    required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                                    value={formData.supplier_id} onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                                >
                                    <option value="">-- Pilih Supplier --</option>
                                    {(suppliers || []).map(sup => (
                                        <option key={sup.id} value={sup.id}>{sup.kode_supplier} - {sup.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Daftar Barang</label>
                                    <button type="button" onClick={handleAddItem} className="text-xs font-bold text-primary-600 hover:underline">+ Tambah Barang</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex-1">
                                                <select 
                                                    required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                                                    value={item.item_id} onChange={(e) => handleItemChange(idx, 'item_id', e.target.value)}
                                                >
                                                    <option value="">-- Pilih Barang --</option>
                                                    {(items || []).map(i => (
                                                        <option key={i.id} value={i.id}>{i.kode_barang} - {i.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <input 
                                                type="number" required min="1" placeholder="Qty"
                                                className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center outline-none"
                                                value={item.quantity_requested} onChange={(e) => handleItemChange(idx, 'quantity_requested', e.target.value)}
                                            />
                                            <button 
                                                type="button" disabled={formData.items.length === 1}
                                                onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)})}
                                                className="p-2 text-rose-300 hover:text-rose-500 disabled:opacity-0"
                                            ><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl">Batal</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white bg-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
                                    {loading ? 'Menyimpan...' : 'Simpan PR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </Layout>
    );
};

export default ManajemenSuratPermintaan;
