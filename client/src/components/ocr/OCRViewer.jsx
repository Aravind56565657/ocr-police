import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, FileText } from 'lucide-react';

export default function OCRViewer({ fileUrl, fileType }) {
    const [scale, setScale] = useState(1);

<<<<<<< HEAD
    const isPdfUrl = fileUrl?.toLowerCase().endsWith('.pdf') || fileType?.toLowerCase() === 'pdf';
    const displayUrl = fileUrl ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${fileUrl.replace(/\\/g, '/')}` : '';
=======
    const isPdfUrl = fileUrl?.toLowerCase().endsWith('.pdf');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const displayUrl = fileUrl ? `${baseUrl.replace('/api', '')}/${fileUrl.replace(/\\/g, '/')}` : '';
>>>>>>> pr-1

    return (
        <div className="relative flex flex-col h-full bg-slate-950/50 rounded-lg overflow-hidden">

            {/* Toolbar - Only visible for raster images since PDFs have their own native browser zooming features */}
            {!isPdfUrl && displayUrl && (
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
            )}

            <div className={`flex-1 flex items-center justify-center ${!isPdfUrl ? 'overflow-auto p-4' : 'overflow-hidden'}`}>
                {displayUrl ? (
                    isPdfUrl ? (
                        <iframe
                            src={`${displayUrl}#toolbar=1&view=Fit`}
                            title="Document Viewer"
                            className="w-full h-full border-0 bg-white"
                        />
                    ) : (
                        <div
                            className="transition-transform duration-200 origin-center flex items-center justify-center min-h-0 min-w-0"
                            style={{ transform: `scale(${scale})` }}
                        >
                            <img
                                src={displayUrl}
                                alt="Document"
                                className="max-w-full max-h-[calc(100vh-18rem)] object-contain shadow-2xl rounded"
                                draggable={false}
                            />
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                        <FileText className="w-8 h-8 opacity-20" />
                        <span className="font-medium text-sm">No document available</span>
                    </div>
                )}
            </div>
        </div>
    );
}
