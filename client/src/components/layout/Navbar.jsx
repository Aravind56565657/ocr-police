import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Navbar() {
    const { dispatch } = useAppContext();

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-white relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full"></span>
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User className="w-4 h-4 text-slate-300" />
                </div>
            </div>
        </header>
    );
}
