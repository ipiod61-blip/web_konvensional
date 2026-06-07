import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LogOut, 
    ShoppingCart, 
    Package, 
    Users, 
    Truck, 
    FileText, 
    FileSpreadsheet, 
    BarChart3,
    Building2,
    Settings,
    Menu,
    ChevronLeft
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
        navigate('/');
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    const kasirLinks = [
        { path: '/kasir/transaksi', label: 'Transaksi', icon: ShoppingCart },
        { path: '/kasir/barang', label: 'Katalog Barang', icon: Package },
    ];

    const manajemenLinks = [
        { path: '/manajemen', label: 'Dashboard Utama', icon: BarChart3 },
        { path: '/manajemen/barang', label: 'Manajemen Barang', icon: Package },
        { path: '/manajemen/surat-permintaan', label: 'Permintaan Barang', icon: FileText },
        { path: '/manajemen/barang-masuk', label: 'Barang Masuk', icon: FileSpreadsheet },
        { path: '/manajemen/laporan', label: 'Laporan', icon: BarChart3 },
        { path: '/manajemen/supplier', label: 'Data Supplier', icon: Truck },
        { path: '/manajemen/karyawan', label: 'Data Karyawan', icon: Users },
    ];

    const links = user?.role === 'kasir' ? kasirLinks : manajemenLinks;

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-slate-200/60 flex flex-col shadow-xl shadow-slate-200/20 z-20 transition-all duration-300 relative ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
                <div className={`h-20 flex items-center border-b border-slate-100 bg-white relative ${isSidebarOpen ? 'px-8 justify-start' : 'px-0 justify-center'}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`}>
                        <Building2 size={22} />
                    </div>
                    {isSidebarOpen && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <span className="text-xl font-bold text-slate-800 tracking-tight">Bakti Jaya</span>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{user?.role === 'kasir' ? 'Kasir Portal' : 'Admin Portal'}</p>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 shadow-sm transition-all z-30 ${!isSidebarOpen ? 'rotate-180' : ''}`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="mb-8 flex flex-col items-center">
                        {isSidebarOpen && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 w-full text-left">Menu Utama</p>}
                        <nav className="space-y-1.5 w-full flex flex-col items-center">
                            {links.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    end={link.path === '/kasir' || link.path === '/manajemen'}
                                    className={({ isActive }) => 
                                        `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isSidebarOpen ? 'w-full' : 'w-12 justify-center px-0'} ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20 translate-x-1' 
                                                : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700 hover:translate-x-1'
                                        }`
                                    }
                                    title={!isSidebarOpen ? link.label : ""}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <link.icon 
                                                className={`flex-shrink-0 h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-primary-600'} ${isSidebarOpen ? 'mr-3' : ''}`} 
                                            />
                                            {isSidebarOpen && <span className="whitespace-nowrap">{link.label}</span>}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center">
                    {isSidebarOpen ? (
                        <div className="bg-white w-full border border-slate-200 rounded-2xl p-4 shadow-sm mb-3 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary-500 to-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-inner mr-3 flex-shrink-0">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-xs font-medium text-slate-500 capitalize truncate">{user?.role}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 mb-3 rounded-full bg-gradient-to-tr from-secondary-500 to-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-inner flex-shrink-0" title={user?.name}>
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <button 
                        onClick={handleLogoutClick}
                        title={!isSidebarOpen ? "Keluar" : ""}
                        className={`group flex items-center justify-center px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 ${isSidebarOpen ? 'w-full' : 'w-12 px-0'}`}
                    >
                        <LogOut className={`h-4 w-4 group-hover:-translate-x-1 transition-transform ${isSidebarOpen ? 'mr-2' : ''}`} />
                        {isSidebarOpen && "Keluar"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
                {/* Decorative background blob */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="p-8 relative z-10 animate-fade-in max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-slide-up border border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-6 mx-auto">
                            <LogOut size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Konfirmasi Keluar</h3>
                        <p className="text-slate-500 text-center text-sm mb-8">Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses panel ini.</p>
                        
                        <div className="flex flex-col space-y-3">
                            <button 
                                onClick={confirmLogout}
                                className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30"
                            >
                                Ya, Saya Yakin
                            </button>
                            <button 
                                onClick={cancelLogout}
                                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
