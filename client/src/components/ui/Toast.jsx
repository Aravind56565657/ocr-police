import React from 'react';
import { useToast, toastEvent } from '../../hooks/useToast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => toastEvent.remove(t.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const borderColors = {
        success: 'border-emerald-500',
        error: 'border-red-500',
        warning: 'border-amber-500',
        info: 'border-blue-500'
    };

    return (
        <div className={clsx(
            "flex items-center gap-3 p-4 bg-slate-900 border-l-4 rounded shadow-card animate-slide-up max-w-sm w-full",
            borderColors[toast.type]
        )}>
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={onDismiss} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
