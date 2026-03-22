import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-slate-950 text-white font-body selection:bg-navy-500/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
