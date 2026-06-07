import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Package, Plus, CheckCircle, FileText, X, History, Clock, User, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

const ManajemenBarangMasuk = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [inwardHistory, setInwardHistory] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    
    const [selectedPR, setSelectedPR] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [prItems, setPrItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [pendingRes, historyRes] = await Promise.all([
                api.get('/purchase-requests/pending'),
                api.get('/goods-inward/history')
            ]);
            setPendingRequests(pendingRes.data || []);
            setInwardHistory(historyRes.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data');
        }
    };

    const fetchAudit = async () => {
        try {
            const res = await api.get('/audit-logs/goods_inward');
            setAuditLogs(res.data || []);
            setIsHistoryOpen(true);
        } catch (error) {
            toast.error('Gagal mengambil riwayat audit');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handlePRChange = async (prId) => {
        setSelectedPR(prId);
        if (!prId) return setPrItems([]);
        try {
            const res = await api.get(`/purchase-requests/${prId}/items`);
            setPrItems((res.data || []).map(i => ({ ...i, quantity_received: 0 })));
        } catch (error) {
            toast.error('Gagal mengambil detail item PR');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const itemsToSubmit = prItems.map(i => ({ item_id: i.item_id, quantity_received: parseInt(i.quantity_received) || 0 }));
            if (itemsToSubmit.every(i => i.quantity_received === 0)) return toast.error('Isi minimal 1 jumlah barang datang');

            await api.post('/goods-inward', { invoice_number: invoiceNumber, request_id: selectedPR, items: itemsToSubmit });
            toast.success('Penerimaan barang berhasil dicatat');
            setIsModalOpen(false);
            setInvoiceNumber('');
            setSelectedPR('');
            setPrItems([]);
            fetchData();
        } catch (error) {
            toast.error('Gagal mencatat barang masuk');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Barang Masuk</h1>
                    <p className="text-slate-500 text-sm">Validasi barang datang dari supplier berdasarkan Purchase Request.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAudit} className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                        <History size={18} className="mr-2" /> History Audit
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                        <Plus size={18} className="mr-2" /> Terima Barang
                    </button>
                </div>
            </div>

            {/* Riwayat Faktur Masuk Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center"><ArrowDownCircle size={16} className="mr-2 text-emerald-500"/> Tabel Riwayat Faktur Masuk</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Invoice / Faktur</th>
                                <th className="px-6 py-4">Kode PR</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Nama Barang</th>
                                <th className="px-6 py-4 text-center">Jumlah Datang</th>
                                <th className="px-6 py-4">Tanggal Masuk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inwardHistory.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{row.invoice_number}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600">{row.kode_permintaan}</td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{row.supplier_name}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{row.item_name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 font-black rounded-lg">+{row.quantity_received}</span>
                                        <span className="text-[10px] text-slate-300 ml-1">/ {row.quantity_requested}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(row.received_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Terima Barang */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Proses Penerimaan Barang</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">No. Invoice / Faktur</label>
                                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Contoh: INV-992288" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pilih Kode Permintaan (PR)</label>
                                    <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" value={selectedPR} onChange={(e) => handlePRChange(e.target.value)}>
                                        <option value="">-- Pilih PR Tertunda --</option>
                                        {(pendingRequests || []).map(pr => <option key={pr.id} value={pr.id}>{pr.kode_permintaan}</option>)}
                                    </select>
                                </div>
                            </div>

                            {prItems.length > 0 && (
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Input Barang yang Diterima</label>
                                    {(prItems || []).map((item, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 md:items-center">
                                            <div className="flex-1">
                                                <p className="text-xs font-mono text-primary-600 font-bold mb-1">{item.kode_barang}</p>
                                                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                                <p className="text-[10px] text-slate-400">Diminta: {item.quantity_requested} | Sisa Kuota: {item.quantity_requested - (item.quantity_received_total || 0)} (Sdh Diterima: {item.quantity_received_total || 0})</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-slate-500">Jumlah Datang:</span>
                                                <input 
                                                    type="number" min="0" required
                                                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-emerald-600 outline-none"
                                                    value={item.quantity_received} 
                                                    onChange={(e) => {
                                                        const newItems = [...prItems];
                                                        newItems[idx].quantity_received = e.target.value;
                                                        setPrItems(newItems);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl">Batal</button>
                                <button type="submit" disabled={loading || !selectedPR} className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
                                    {loading ? 'Menyimpan...' : 'Konfirmasi Kedatangan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Audit Modal */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">History Audit Inward</h3>
                            <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg"><X size={20}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {auditLogs.map(log => (
                                <div key={log.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ArrowDownCircle size={20}/>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{log.action}</span>
                                            <span className="text-[10px] text-slate-400 flex items-center"><Clock size={10} className="mr-1"/> {log.waktu}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800">Penerimaan Barang Masuk #{log.record_id}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 flex items-center"><User size={10} className="mr-1"/> Pelaksana: {log.pelaksana}</p>
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

export default ManajemenBarangMasuk;
