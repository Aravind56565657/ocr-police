import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, Search, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';

export default function Sidebar() {
    const location = useLocation();
    const { state } = useAppContext();

    if (!state.sidebarOpen) return null;

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Upload', path: '/upload', icon: Upload },
        { name: 'Records', path: '/records', icon: FileText },
        { name: 'Search', path: '/search', icon: Search },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-navy-600 rounded flex items-center justify-center font-bold text-white text-lg">
                    P
                </div>
                <span className="font-display font-bold text-lg tracking-wide text-white">OCR Police</span>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.path ||
                        (link.path !== '/' && location.pathname.startsWith(link.path));

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-navy-600/10 text-navy-400"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 px-3 py-2 w-full rounded text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </aside>
    );
}
