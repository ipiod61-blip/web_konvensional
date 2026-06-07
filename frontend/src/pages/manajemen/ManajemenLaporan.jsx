import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { BarChart3, FileSpreadsheet, FileText, Download, Calendar, Package, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

const ManajemenLaporan = () => {
    const [activeTab, setActiveTab] = useState('sales'); 
    const [salesData, setSalesData] = useState([]);
    const [inwardsData, setInwardsData] = useState([]);
    
    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const fetchReports = async () => {
        try {
            const params = { month: filter.month, year: filter.year };
            const [salesRes, inwardsRes] = await Promise.all([
                api.get('/reports/sales/detail', { params }),
                api.get('/reports/inwards/detail', { params })
            ]);
            setSalesData(salesRes.data || []);
            setInwardsData(inwardsRes.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data laporan');
        }
    };

    useEffect(() => { fetchReports(); }, [filter]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        const title = activeTab === 'sales' ? 'Laporan Penjualan' : 'Laporan Barang Masuk';
        const period = `${filter.month}/${filter.year}`;
        
        doc.setFontSize(18);
        doc.text('Toko Bangunan Bakti Jaya', 14, 15);
        doc.setFontSize(14);
        doc.text(title, 14, 22);
        doc.setFontSize(10);
        doc.text(`Periode: ${period}`, 14, 28);
        
        if (activeTab === 'sales') {
            const tableColumn = ["Kode Transaksi", "Tanggal", "Kasir", "Barang", "Metode", "Qty", "Total"];
            const tableRows = (salesData || []).map(row => [
                row.kode_transaksi,
                row.tanggal,
                row.kasir,
                row.barang,
                row.payment_method?.toUpperCase() || 'TUNAI',
                row.qty,
                `Rp ${Number(row.subtotal).toLocaleString()}`
            ]);
            
            autoTable(doc, {
                startY: 35,
                head: [tableColumn],
                body: tableRows,
                headStyles: { fillColor: [79, 70, 229] }
            });
        } else {
            const tableColumn = ["No. Faktur", "Tanggal", "Kode PR", "Supplier", "Penerima", "Barang", "Qty"];
            const tableRows = (inwardsData || []).map(row => [
                row.invoice_number,
                row.tanggal,
                row.kode_permintaan,
                row.supplier,
                row.penerima,
                row.barang,
                row.qty
            ]);
            
            autoTable(doc, {
                startY: 35,
                head: [tableColumn],
                body: tableRows,
                headStyles: { fillColor: [16, 185, 129] }
            });
        }
        
        doc.save(`${title.replace(/\s/g, '_')}_${period.replace('/', '_')}.pdf`);
    };

    const exportToExcel = () => {
        const title = activeTab === 'sales' ? 'Laporan Penjualan' : 'Laporan Barang Masuk';
        const worksheet = XLSX.utils.json_to_sheet(activeTab === 'sales' ? salesData : inwardsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
        XLSX.writeFile(workbook, `${title.replace(/\s/g, '_')}.xlsx`);
    };

    const totalSalesAmount = salesData.reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);
    const totalInwardsItems = inwardsData.reduce((acc, curr) => acc + Number(curr.qty || 0), 0);

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Laporan & Rekapitulasi</h1>
                    <p className="text-slate-500 text-sm">Download data transaksi dalam format PDF atau Excel.</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={exportToExcel} className="flex items-center px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl transition-all">
                        <FileSpreadsheet size={18} className="mr-2" /> Excel
                    </button>
                    <button onClick={exportToPDF} className="flex items-center px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl transition-all">
                        <FileText size={18} className="mr-2" /> PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl">
                        <button onClick={() => setActiveTab('sales')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sales' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}>Penjualan</button>
                        <button onClick={() => setActiveTab('inwards')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inwards' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}>Barang Masuk</button>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200">
                        <Calendar size={18} className="text-slate-400 ml-2" />
                        <select className="bg-transparent border-none outline-none text-sm font-bold" value={filter.month} onChange={(e) => setFilter({...filter, month: e.target.value})}>
                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
                        </select>
                        <select className="bg-transparent border-none outline-none text-sm font-bold" value={filter.year} onChange={(e) => setFilter({...filter, year: e.target.value})}>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Total {activeTab === 'sales' ? 'Pendapatan' : 'Barang Diterima'}</p>
                            <p className="text-2xl font-black text-blue-900">{activeTab === 'sales' ? `Rp ${totalSalesAmount.toLocaleString()}` : `${totalInwardsItems} Unit`}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg"><BarChart3 size={24}/></div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Volume Data</p>
                            <p className="text-2xl font-black text-emerald-900">{(activeTab === 'sales' ? salesData : inwardsData).length} Transaksi</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><FileText size={24}/></div>
                    </div>
                </div>

                <div className="overflow-x-auto p-6">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            {activeTab === 'sales' ? (
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Kode TRX</th>
                                    <th className="px-6 py-4">Kasir</th>
                                    <th className="px-6 py-4">Barang</th>
                                    <th className="px-6 py-4">Metode</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                    <th className="px-6 py-4 text-right">Subtotal</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">Kode PR</th>
                                    <th className="px-6 py-4">Supplier</th>
                                    <th className="px-6 py-4">Barang</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeTab === 'sales' ? (
                                salesData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{row.tanggal}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-primary-600">{row.kode_transaksi}</td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{row.kasir}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{row.barang}</td>
                                        <td className="px-6 py-4"><span className="text-[10px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-bold">{row.payment_method?.toUpperCase() || 'TUNAI'}</span></td>
                                        <td className="px-6 py-4 text-center font-bold">{row.qty}</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600">Rp {Number(row.subtotal).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                inwardsData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{row.tanggal}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{row.invoice_number}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-primary-600">{row.kode_permintaan}</td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{row.supplier}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{row.barang}</td>
                                        <td className="px-6 py-4 text-center font-black text-emerald-600">+{row.qty}</td>
                                    </tr>
                                ))
                            )}
                            {(activeTab === 'sales' ? salesData : inwardsData).length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Tidak ada data untuk periode ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ManajemenLaporan;
