import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';
import FilePreview from './FilePreview';

export default function UploadZone({ files, setFiles, maxSizeMB = 20 }) {
    const onDrop = useCallback((accepted, rejected) => {
        if (rejected.length > 0) {
            alert(`Some files were rejected. Max size is ${maxSizeMB}MB and only images/PDFs are allowed.`);
        }
        setFiles(prev => [...prev, ...accepted]);
    }, [setFiles, maxSizeMB]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/tiff': ['.tiff', '.tif'],
            'application/pdf': ['.pdf']
        },
        maxSize: maxSizeMB * 1024 * 1024
    });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div
                {...getRootProps()}
                className={clsx(
                    "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/50",
                    isDragActive ? "border-navy-500 bg-navy-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                )}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className={clsx("w-8 h-8 transition-colors", isDragActive ? "text-navy-400" : "text-slate-400")} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                    {isDragActive ? "Drop the files here" : "Drag & drop files here"}
                </h3>
                <p className="text-sm text-slate-400 text-center mb-4">
                    Strictly PDFs, JPGs, PNGs, TIFFs. Max <span className="text-slate-300 font-medium">{maxSizeMB}MB</span> per file.
                </p>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                    Browse Files
                </button>
            </div>

            {files.length > 0 && (
                <div className="flex flex-col gap-3 mt-4">
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Queue ({files.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {files.map((file, idx) => (
                            <FilePreview key={`${file.name}-${idx}`} file={file} onRemove={() => removeFile(idx)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
