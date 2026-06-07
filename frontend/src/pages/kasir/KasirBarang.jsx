import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { Package, Search } from 'lucide-react';
import { toast } from 'sonner';

const KasirBarang = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get('/items');
                setItems(res.data);
            } catch (error) {
                toast.error('Gagal mengambil data barang');
            }
        };
        fetchItems();
    }, []);

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
        (item.kategori && item.kategori.toLowerCase().includes(search.toLowerCase())) ||
        (item.merk && item.merk.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Katalog Barang</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Informasi stok dan harga barang saat ini.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kode, nama, merk, kategori..." 
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
                                <th className="px-6 py-4">Kode Barang</th>
                                <th className="px-6 py-4">Nama Barang</th>
                                <th className="px-6 py-4">Merk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4 text-right">Harga Jual</th>
                                <th className="px-6 py-4 text-center">Stok</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{item.kode_barang}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.merk || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{item.kategori || 'Umum'}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-600 text-right">
                                        Rp {Number(item.price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data barang yang ditemukan.
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

export default KasirBarang;
