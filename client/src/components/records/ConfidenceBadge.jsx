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
        <div className="flex items-center gap-1.5">
            <div className={clsx(
                "rounded-full shadow-[0_0_8px_currentColor]",
                level.color,
                size === 'sm' ? "w-2 h-2" : "w-2.5 h-2.5"
            )} />
            {showLabel && (
                <span className={clsx("font-medium", size === 'sm' ? "text-xs" : "text-sm",
                    level.color.replace('bg-', 'text-')
                )}>
                    {Math.round(confidence * 100)}% {level.label}
                </span>
            )}
        </div>
    );
}
