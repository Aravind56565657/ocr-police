import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OCRViewer({ fileUrl, fileType }) {
    const [scale, setScale] = useState(1);
    const [page, setPage] = useState(1);

    const isPdfUrl = fileUrl?.toLowerCase().endsWith('.pdf');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const displayUrl = fileUrl ? `${baseUrl.replace('/api', '')}/${fileUrl.replace(/\\/g, '/')}` : '';

    return (
        <div className="relative flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800 z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale(s => Math.max(0.2, s - 0.2))}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono w-12 text-center text-slate-300">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.min(3, s + 0.2))}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={() => setScale(1)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Reset Zoom"
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/50">
                {displayUrl ? (
                    <div
                        className="transition-transform duration-200 origin-center"
                        style={{ transform: `scale(${scale})` }}
                    >
                        {isPdfUrl ? (
                            <embed src={displayUrl} type="application/pdf" className="w-[800px] h-[1000px]" />
                        ) : (
                            <img src={displayUrl} alt="Document" className="max-w-none shadow-2xl" />
                        )}
                    </div>
                ) : (
                    <div className="text-slate-500 font-medium">No document available</div>
                )}
            </div>
        </div>
    );
}
