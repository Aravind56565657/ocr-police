import React from 'react';
import { clsx } from 'clsx';

export default function Badge({ children, variant = 'default', className }) {
    const variants = {
        default: "bg-slate-800 text-slate-300",
        primary: "bg-navy-500/20 text-navy-300",
        success: "bg-emerald-500/20 text-emerald-400",
        warning: "bg-amber-500/20 text-amber-400",
        danger: "bg-red-500/20 text-red-400",
    };

    return (
        <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
            {children}
        </span>
    );
}
