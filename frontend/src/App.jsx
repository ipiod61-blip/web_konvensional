import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Kasir Pages
import KasirBarang from './pages/kasir/KasirBarang';
import KasirTransaksi from './pages/kasir/KasirTransaksi';

// Manajemen Pages
import ManajemenDashboard from './pages/manajemen/ManajemenDashboard';
import ManajemenBarang from './pages/manajemen/ManajemenBarang';
import ManajemenSuratPermintaan from './pages/manajemen/ManajemenSuratPermintaan';
import ManajemenBarangMasuk from './pages/manajemen/ManajemenBarangMasuk';
import ManajemenKaryawan from './pages/manajemen/ManajemenKaryawan';
import ManajemenSupplier from './pages/manajemen/ManajemenSupplier';
import ManajemenLaporan from './pages/manajemen/ManajemenLaporan';

// Stubs for missing pages
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Kasir Routes */}
          <Route path="/kasir" element={<ProtectedRoute role="kasir"><Navigate to="/kasir/transaksi" /></ProtectedRoute>} />
          <Route path="/kasir/barang" element={<ProtectedRoute role="kasir"><KasirBarang /></ProtectedRoute>} />
          <Route path="/kasir/transaksi" element={<ProtectedRoute role="kasir"><KasirTransaksi /></ProtectedRoute>} />

          {/* Manajemen Routes */}
          <Route path="/manajemen" element={<ProtectedRoute role="manajemen"><ManajemenDashboard /></ProtectedRoute>} />
          <Route path="/manajemen/karyawan" element={<ProtectedRoute role="manajemen"><ManajemenKaryawan /></ProtectedRoute>} />
          <Route path="/manajemen/supplier" element={<ProtectedRoute role="manajemen"><ManajemenSupplier /></ProtectedRoute>} />
          <Route path="/manajemen/barang" element={<ProtectedRoute role="manajemen"><ManajemenBarang /></ProtectedRoute>} />
          <Route path="/manajemen/surat-permintaan" element={<ProtectedRoute role="manajemen"><ManajemenSuratPermintaan /></ProtectedRoute>} />
          <Route path="/manajemen/barang-masuk" element={<ProtectedRoute role="manajemen"><ManajemenBarangMasuk /></ProtectedRoute>} />
          <Route path="/manajemen/laporan" element={<ProtectedRoute role="manajemen"><ManajemenLaporan /></ProtectedRoute>} />


          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
