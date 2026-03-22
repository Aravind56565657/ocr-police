import React from 'react';
import { File, X, FileImage, FileText } from 'lucide-react';

export default function FilePreview({ file, onRemove }) {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    return (
        <div className="relative flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg group animate-fade-in">
            <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                {isImage ? (
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover opacity-80" />
                ) : isPdf ? (
                    <FileText className="w-5 h-5 text-red-400" />
                ) : (
                    <File className="w-5 h-5 text-slate-400" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
