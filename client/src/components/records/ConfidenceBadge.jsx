import React from 'react';
import { clsx } from 'clsx';

export default function ConfidenceBadge({ confidence, showLabel = true, size = 'sm' }) {
    const getLevel = (conf) => {
        if (conf >= 0.8) return { color: 'bg-emerald-500', label: 'High' };
        if (conf >= 0.6) return { color: 'bg-amber-500', label: 'Medium' };
        return { color: 'bg-red-500', label: 'Low' };
    };

    const level = getLevel(confidence);

    return (
        <div className="flex items-center gap-2">
            <div className={clsx(
                "rounded-full transition-all duration-700",
                level.color,
                level.color === 'bg-emerald-500' ? "shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
                    level.color === 'bg-amber-500' ? "shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
                        "shadow-[0_0_12px_rgba(239,68,68,0.4)]",
                size === 'sm' ? "w-1.5 h-1.5" : "w-2 h-2"
            )} />
            {showLabel && (
                <span className={clsx("font-black uppercase tracking-[0.1em]", size === 'sm' ? "text-[9px]" : "text-xs",
                    level.color.replace('bg-', 'text-')
                )}>
                    {Math.round(confidence * 100)}% {level.label}
                </span>
            )}
        </div>
    );
}
