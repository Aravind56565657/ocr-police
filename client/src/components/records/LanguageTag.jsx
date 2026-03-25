import React from 'react';
import { clsx } from 'clsx';

const langColors = {
    English: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Hindi: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Telugu: "bg-green-500/20 text-green-400 border-green-500/30",
    Tamil: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Kannada: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Malayalam: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Marathi: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    Bengali: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    default: "bg-slate-700/50 text-slate-300 border-slate-600"
};

export default function LanguageTag({ languageName, confidence, className }) {
    const colorClass = langColors[languageName] || langColors.default;

    return (
        <span className={clsx(
            "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border transition-all duration-300 hover:scale-105",
            colorClass,
            className
        )}>
            <div className={clsx("w-1 h-1 rounded-full", colorClass.split(' ')[1].replace('text-', 'bg-'))} />
            {languageName}
            {confidence && <span className="opacity-40 text-[8px] ml-1">{Math.round(confidence * 100)}%</span>}
        </span>
    );
}
