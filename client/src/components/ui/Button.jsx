import React from 'react';
import { clsx } from 'clsx';
import Spinner from './Spinner';

export default function Button({ children, variant = 'primary', size = 'md', isLoading, disabled, className, ...props }) {
    const baseClass = "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950";

    const variants = {
        primary: "bg-navy-600 hover:bg-navy-500 text-white focus:ring-navy-500",
        secondary: "bg-slate-800 hover:bg-slate-700 text-white focus:ring-slate-700",
        outline: "border border-slate-700 hover:bg-slate-800 text-white focus:ring-slate-600",
        danger: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500",
        ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={clsx(
                baseClass,
                variants[variant],
                sizes[size],
                (disabled || isLoading) && "opacity-60 cursor-not-allowed",
                className
            )}
            {...props}
        >
            {isLoading && <Spinner className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
}
