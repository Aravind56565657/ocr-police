import React, { useState } from 'react';
import { Copy, RefreshCw, Check, Languages, Loader2, Download, X } from 'lucide-react';
import LanguageTag from '../records/LanguageTag';
import api from '../../services/api';

const FONTS = [
    'Arial', 'Times New Roman', 'Calibri', 'Verdana', 'Georgia',
    'Courier New', 'Tahoma', 'Trebuchet MS', 'Garamond', 'Helvetica'
];

export default function RawTextPanel({ rawText, languages, lowConfidenceWords }) {
    const [copied, setCopied] = useState(false);
    
    // Translation States
    const [targetLang, setTargetLang] = useState('English');
    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState('');

    // Download States
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('pdf');
    const [downloadFont, setDownloadFont] = useState('Arial');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(rawText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTranslate = async () => {
        if (!rawText) return;
        if (translations[targetLang]) return;

        setIsTranslating(true);
        setError('');
        try {
            const res = await api.post('/records/translate', { text: rawText, targetLanguage: targetLang });
            setTranslations(prev => ({ ...prev, [targetLang]: res.data?.translation || res.translation || '' }));
        } catch (err) {
            setError(err.message || 'Translation failed');
        } finally {
            setIsTranslating(false);
        }
    };

    const currentText = translations[targetLang] || rawText;

    const handleDownload = async () => {
        if (!currentText) {
            setDownloadError('Text is empty');
            return;
        }
        setIsDownloading(true);
        setDownloadError('');
        try {
            const response = await api.post('/records/download', {
                text: currentText,
                selected_format: downloadFormat,
                selected_font: downloadFont
            }, {
                responseType: 'blob' // crucial for binary download
            });

            // Fallback for axios if 'res.data' interceptor returns directly
            const blobData = response.data instanceof Blob ? response.data : response; 
            
            if (!(blobData instanceof Blob)) {
                throw new Error("Invalid response from server (not a file).");
            }
            
            // Create object URL & trigger download
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `extracted_text_${Date.now()}.${downloadFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setShowDownloadMenu(false);
        } catch (err) {
            console.error(err);
            setDownloadError(err.message || 'Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex gap-2 flex-wrap">
                    {languages?.map(lang => (
                        <LanguageTag key={lang.languageCode} languageName={lang.languageName} confidence={lang.confidence} />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Copy Raw Text"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Download Text"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 bg-navy-600 hover:bg-navy-500 text-white text-xs font-medium rounded transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Re-process
                    </button>
                </div>
            </div>

            {/* Download Controls Popup */}
            {showDownloadMenu && (
                <div className="p-3 border-b border-slate-700 bg-slate-800 absolute top-[60px] right-4 z-20 w-72 rounded-md shadow-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Download Options</span>
                        <button onClick={() => setShowDownloadMenu(false)} className="text-slate-400 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-700/50 p-2 rounded text-[10px] text-slate-400 mb-1">
                        Downloading: <span className="text-indigo-400 font-medium">{translations[targetLang] ? `${targetLang} Translation` : 'Original OCR Text'}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wide">Format</label>
                        <select 
                            value={downloadFormat}
                            onChange={(e) => setDownloadFormat(e.target.value)}
                            className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1.5 outline-none focus:border-indigo-500"
                        >
                            <option value="pdf">PDF</option>
                            <option value="docx">Word (.docx)</option>
                            <option value="txt">TXT</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wide">Font Style</label>
                        <select 
                            value={downloadFont}
                            onChange={(e) => setDownloadFont(e.target.value)}
                            className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1.5 outline-none focus:border-indigo-500"
                        >
                            {FONTS.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>

                    {downloadError && <p className="text-[10px] text-red-400">{downloadError}</p>}

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading || !currentText}
                        className="mt-1 w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"
                    >
                        {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Confirm Download
                    </button>
                </div>
            )}

            {/* Translation Controls (Kept intact from previous phase) */}
            <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Languages className="w-4 h-4" />
                    <span className="font-medium font-display text-xs">Translate Text:</span>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="English">English</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Tamil">Tamil</option>
                    </select>
                    <button
                        onClick={handleTranslate}
                        disabled={isTranslating || !rawText}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors flex items-center gap-2"
                    >
                        {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {translations[targetLang] ? 'Translated' : 'Translate'}
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Original Document Text</h3>
                    <pre className="font-mono text-xs whitespace-pre-wrap text-slate-300 leading-relaxed max-w-full">
                        {rawText || 'No text extracted.'}
                    </pre>
                </div>
                
                {(translations[targetLang] || error || isTranslating) && (
                    <div className="pt-4 border-t border-slate-800">
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-2">
                            Translation output ({targetLang})
                            {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                        </h3>
                        {error ? (
                            <p className="text-xs text-red-500 bg-red-950/30 p-2 rounded">{error}</p>
                        ) : (
                            <pre className="font-mono text-xs whitespace-pre-wrap text-emerald-400 leading-relaxed bg-slate-950 p-3 rounded-md border border-slate-800/50">
                                {translations[targetLang]}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
