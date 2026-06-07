import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Search, Receipt, Wallet, CreditCard, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const KasirTransaksi = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [merkFilter, setMerkFilter] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('tunai');
    const [amountPaid, setAmountPaid] = useState('');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

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

    const categories = [...new Set(items.map(i => i.kategori).filter(Boolean))];
    const merks = [...new Set(items.map(i => i.merk).filter(Boolean))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.kode_barang.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !categoryFilter || item.kategori === categoryFilter;
        const matchesMerk = !merkFilter || item.merk === merkFilter;
        return matchesSearch && matchesCategory && matchesMerk && item.stock > 0;
    });

    const addToCart = (item) => {
        const existing = cart.find(cartItem => cartItem.item_id === item.id);
        if (existing) {
            if (existing.quantity >= item.stock) return toast.warning('Stok tidak mencukupi');
            setCart(cart.map(cartItem => cartItem.item_id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
        } else {
            setCart([...cart, { 
                item_id: item.id, kode_barang: item.kode_barang, name: item.name, 
                merk: item.merk, kategori: item.kategori,
                price: parseFloat(item.price), quantity: 1, maxStock: item.stock
            }]);
        }
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        const itemInCart = cart.find(i => i.item_id === id);
        if (newQuantity > itemInCart.maxStock) return toast.warning('Melebihi stok');
        setCart(cart.map(cartItem => cartItem.item_id === id ? { ...cartItem, quantity: newQuantity } : cartItem));
    };

    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const changeAmount = Math.max(0, (parseFloat(amountPaid) || 0) - totalPrice);

    const handleCheckout = async () => {
        if (paymentMethod === 'tunai' && (parseFloat(amountPaid) || 0) < totalPrice) {
            return toast.error('Uang pelanggan tidak mencukupi!');
        }
        
        setLoading(true);
        try {
            const payload = {
                totalPrice: totalPrice,
                payment_method: paymentMethod,
                amount_paid: paymentMethod === 'tunai' ? parseFloat(amountPaid) : totalPrice,
                change_amount: paymentMethod === 'tunai' ? changeAmount : 0,
                items: cart.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    price_per_unit: item.price
                }))
            };
            
            await api.post('/transactions', payload);
            toast.success('Transaksi Berhasil!');
            setCart([]);
            setAmountPaid('');
            setIsCheckoutModalOpen(false);
            const itemsRes = await api.get('/items');
            setItems(itemsRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaksi Gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Transaksi Kasir</h1>
                    <p className="text-slate-500 text-sm">Input penjualan dan hitung pembayaran.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
                {/* Product List */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari barang..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20" />
                        </div>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                            <option value="">Semua Kategori</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={merkFilter} onChange={(e) => setMerkFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                            <option value="">Semua Merk</option>
                            {merks.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-primary-500 cursor-pointer transition-all hover:shadow-md group">
                                <span className="text-[10px] font-mono text-slate-400">{item.kode_barang}</span>
                                <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 truncate">{item.name}</h3>
                                <div className="flex gap-2 mt-1 mb-2">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{item.merk || 'No Merk'}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary-50 rounded text-primary-600">{item.kategori || 'Umum'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-600 font-bold">Rp {Number(item.price).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400">Stok: {item.stock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart & Checkout */}
                <div className="w-full lg:w-96 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                    <div className="p-4 bg-primary-600 text-white font-bold flex justify-between items-center">
                        <span className="flex items-center"><ShoppingCart size={18} className="mr-2"/> Keranjang</span>
                        <span className="text-xs">{cart.length} item</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {cart.map(item => (
                            <div key={item.item_id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                                        <p className="text-[10px] text-slate-500">@{item.price.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => setCart(cart.filter(i => i.item_id !== item.item_id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.item_id, item.quantity - 1)} className="p-1 bg-slate-100 rounded hover:bg-slate-200"><Minus size={12}/></button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.item_id, item.quantity + 1)} className="p-1 bg-slate-100 rounded hover:bg-slate-200"><Plus size={12}/></button>
                                    </div>
                                    <span className="text-xs font-bold text-primary-600">Rp {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 font-bold">Total</span>
                            <span className="text-2xl font-black text-slate-800">Rp {totalPrice.toLocaleString()}</span>
                        </div>
                        <button 
                            disabled={cart.length === 0}
                            onClick={() => setIsCheckoutModalOpen(true)}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            Bayar Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Pembayaran</h3>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-rose-500 font-bold">Tutup</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setPaymentMethod('tunai')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'tunai' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <Wallet size={20} className="mb-1"/>
                                    <span className="text-[10px] font-bold">Tunai</span>
                                </button>
                                <button onClick={() => setPaymentMethod('qris')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'qris' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <QrCode size={20} className="mb-1"/>
                                    <span className="text-[10px] font-bold">QRIS</span>
                                </button>
                                <button onClick={() => setPaymentMethod('debit')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'debit' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <CreditCard size={20} className="mb-1"/>
                                    <span className="text-[10px] font-bold">Debit</span>
                                </button>
                            </div>

                            {paymentMethod === 'tunai' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Uang Pelanggan (Rp)</label>
                                        <input 
                                            type="number" autoFocus
                                            className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-2xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl">
                                        <span className="text-xs font-bold text-emerald-600">Kembalian</span>
                                        <span className="text-xl font-black text-emerald-700">Rp {changeAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleCheckout}
                                disabled={loading || (paymentMethod === 'tunai' && (!amountPaid || parseFloat(amountPaid) < totalPrice))}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Memproses...' : 'Konfirmasi & Cetak Struk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default KasirTransaksi;
