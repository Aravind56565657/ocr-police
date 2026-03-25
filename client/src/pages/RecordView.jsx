import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, FileText, CheckCircle2, History, RotateCcw, Copy, Code2, Pencil, Check, X, Languages, Download } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import EditableField from '../components/records/EditableField';
import ConfidenceBadge from '../components/records/ConfidenceBadge';
import LanguageTag from '../components/records/LanguageTag';
import OCRViewer from '../components/ocr/OCRViewer';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function RecordView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [record, setRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Raw Text Editing State
    const [isEditingRaw, setIsEditingRaw] = useState(false);
    const [rawTextEdit, setRawTextEdit] = useState('');
    const [isSavingRaw, setIsSavingRaw] = useState(false);

    // Translation & Download (Vamsi PR integration)
    const [targetLang, setTargetLang] = useState('English');
    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('pdf');
    const [downloadFont, setDownloadFont] = useState('Arial');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        loadRecord();
    }, [id]);

    const loadRecord = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/records/${id}`);
            const rec = res.data.record || res.data.data?.record;
            setRecord(rec);
            setRawTextEdit(rec?.rawExtractedText || '');
        } catch (err) {
            toast.error('Failed to load record');
            navigate('/records');
        } finally {
            setIsLoading(false);
        }
    };

    // Add reprocessing state
    const [isReprocessing, setIsReprocessing] = useState(false);

    const handleSaveRawText = async () => {
        try {
            setIsSavingRaw(true);
            await api.patch(`/records/${id}/field`, {
                fieldPath: 'rawExtractedText',
                newValue: rawTextEdit
            });
            setRecord(prev => ({ ...prev, rawExtractedText: rawTextEdit }));
            toast.success('Raw text updated successfully');
            setIsEditingRaw(false);
        } catch (err) {
            toast.error('Failed to update raw text');
        } finally {
            setIsSavingRaw(false);
        }
    };

    const handleReprocessOCR = async () => {
        try {
            setIsReprocessing(true);
            toast.info('Re-running OCR and AI Extraction...');
            const res = await api.post(`/upload/${id}/reprocess`);
            toast.success('Document re-processed successfully!');
            const rec = res.data.record || res.data.data?.record;
            setRecord(rec);
            setRawTextEdit(rec?.rawExtractedText || '');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reprocess document');
        } finally {
            setIsReprocessing(false);
        }
    };

    const handleTranslate = async () => {
        if (!record?.rawExtractedText) return;
        if (translations[targetLang]) return;

        setIsTranslating(true);
        try {
            const res = await api.post('/records/translate', { text: record.rawExtractedText, targetLanguage: targetLang });
            setTranslations(prev => ({ ...prev, [targetLang]: res.data?.translation || res.translation || '' }));
            toast.success('Translation complete!');
        } catch (err) {
            toast.error(err.message || 'Translation failed');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleDownload = async () => {
        const currentText = translations[targetLang] || record?.rawExtractedText;
        if (!currentText) return toast.error('Text is empty');
        setIsDownloading(true);
        try {
            const response = await api.post('/records/download', {
                text: currentText,
                selected_format: downloadFormat,
                selected_font: downloadFont
            }, { responseType: 'blob' });

            const blobData = response.data instanceof Blob ? response.data : response;
            if (!(blobData instanceof Blob)) throw new Error("Invalid response from server");

            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `extracted_text_${Date.now()}.${downloadFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setShowDownloadMenu(false);
            toast.success('Download started!');
        } catch (err) {
            toast.error(err.message || 'Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!record) return null;

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-6 pb-4">
            {/* Header - Fixed Height */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 shadow-lg shadow-black/20 shrink-0">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="group p-2.5 bg-slate-800/50 hover:bg-navy-600/20 rounded-xl text-slate-400 hover:text-navy-400 transition-all duration-300 border border-slate-700/50 hover:border-navy-500/30"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-display font-bold text-white tracking-tight">
                                {record.originalFileName || 'Untitled Document'}
                            </h1>
                            {record.requiresManualReview && (
                                <Badge variant="warning" icon={AlertTriangle} className="animate-pulse shadow-sm shadow-orange-900/20">Review Needed</Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            Uploaded {new Date(record.createdAt || record.uploadedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" icon={History} className="hover:scale-105 transition-transform active:scale-95">
                        History
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={RotateCcw}
                        onClick={handleReprocessOCR}
                        isLoading={isReprocessing}
                        className="shadow-lg shadow-navy-600/20 hover:scale-105 transition-transform active:scale-95"
                    >
                        Reprocess
                    </Button>
                </div>
            </div>

            {/* Main Content - Flex-1 (Takes remaining space) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 flex-1 min-h-0">

                {/* Left: Original Document Panel */}
                <div className="group bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl flex flex-col shadow-xl overflow-hidden transition-all duration-500 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-black/40">
                    <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-navy-400" />
                            Source Document
                        </h2>
                        <Badge variant="secondary" className="uppercase text-[9px] font-black tracking-widest bg-slate-800/80 border-slate-700/50">{record.fileType}</Badge>
                    </div>
                    <div className="flex-1 bg-black/60 relative overflow-hidden group-hover:bg-black/40 transition-colors">
                        <OCRViewer fileUrl={record.originalFileUrl} fileType={record.fileType} />
                    </div>
                </div>

                {/* Right: Raw Content Analysis */}
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl flex flex-col shadow-xl overflow-hidden transition-all duration-500 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-black/40">
                    <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
                            <Code2 className="w-4 h-4 text-emerald-400" />
                            Extracted Content
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{Math.round((record.overallOCRConfidence || 0) * 100)}% Confidence</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-950/20 shadow-inner">
                        <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
                            {isReprocessing && (
                                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md rounded-2xl flex items-center justify-center border border-navy-500/20">
                                    <Spinner size="lg" />
                                </div>
                            )}

                            {/* Toolbar: Languages, Translate, Download, Edit */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Detected Languages</span>
                                        <div className="flex flex-wrap gap-2">
                                            {record.detectedLanguages?.map((lang, i) => (
                                                <LanguageTag key={i} languageName={lang.languageName} confidence={lang.confidence} className="hover:scale-105 transition-transform cursor-default" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {!isEditingRaw ? (
                                    <div className="flex items-center gap-2.5">
                                        {/* Translate Action */}
                                        <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 rounded-xl p-1.5 shadow-inner">
                                            <div className="p-1 text-navy-400"><Languages className="w-4 h-4" /></div>
                                            <select
                                                value={targetLang}
                                                onChange={(e) => setTargetLang(e.target.value)}
                                                className="bg-transparent text-slate-400 text-[11px] px-1 outline-none font-bold uppercase tracking-tighter appearance-none cursor-pointer hover:text-white transition-colors"
                                            >
                                                <option className="bg-slate-900 font-bold">English</option>
                                                <option className="bg-slate-900 font-bold">Telugu</option>
                                                <option className="bg-slate-900 font-bold">Hindi</option>
                                                <option className="bg-slate-900 font-bold">Tamil</option>
                                            </select>
                                            <button
                                                onClick={handleTranslate}
                                                disabled={isTranslating}
                                                className="px-4 py-1.5 bg-navy-600 hover:bg-navy-500 rounded-lg text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-navy-900/40 disabled:opacity-50"
                                            >
                                                {isTranslating ? '...' : 'Translate'}
                                            </button>
                                        </div>

                                        {/* Download Action */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                                className="p-3 bg-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl transition-all duration-300 border border-indigo-500/20 active:scale-95 shadow-lg shadow-indigo-900/10"
                                                title="Report Management"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {showDownloadMenu && (
                                                <div className="absolute top-14 right-0 z-30 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 flex flex-col gap-5 animate-slide-up backdrop-blur-xl">
                                                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Generate Report</span>
                                                        <button onClick={() => setShowDownloadMenu(false)} className="text-slate-500 hover:text-white transition-colors p-1"><X className="w-4 h-4" /></button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Format</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {['pdf', 'docx', 'txt'].map(fmt => (
                                                                    <button
                                                                        key={fmt}
                                                                        onClick={() => setDownloadFormat(fmt)}
                                                                        className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${downloadFormat === fmt ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                                                    >
                                                                        {fmt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                                            <p className="text-[9px] text-indigo-400 font-bold uppercase mb-1">Source Content</p>
                                                            <p className="text-xs text-white/80 font-medium truncate">{translations[targetLang] ? `${targetLang} Translation` : 'Raw Extracted Text'}</p>
                                                        </div>
                                                        <button
                                                            onClick={handleDownload}
                                                            disabled={isDownloading}
                                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 group disabled:opacity-50"
                                                        >
                                                            {isDownloading ? <Spinner className="w-3.5 h-3.5" /> : <Download className="w-4 h-4 group-hover:bounce" />} Download Report
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit Action */}
                                        <button
                                            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all duration-300 border border-slate-700 active:scale-95 shadow-lg shadow-black/10"
                                            onClick={() => {
                                                setIsEditingRaw(true);
                                                setRawTextEdit(record.rawExtractedText);
                                            }}
                                            title="Manual Correction"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                            onClick={handleSaveRawText}
                                            disabled={isSavingRaw}
                                        >
                                            {isSavingRaw ? <Spinner className="w-3.5 h-3.5" /> : <Check className="w-4 h-4" />} Save
                                        </button>
                                        <button
                                            className="px-5 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all active:scale-95 border border-slate-700 text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => {
                                                setIsEditingRaw(false);
                                                setRawTextEdit(record.rawExtractedText);
                                            }}
                                            disabled={isSavingRaw}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content Display Area */}
                            <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar p-0 bg-transparent rounded-2xl relative group">
                                <div className={`flex-1 min-h-[400px] p-8 bg-[#020617]/80 rounded-2xl border border-slate-800/60 shadow-inner overflow-hidden transition-all duration-500 ${isEditingRaw ? 'ring-2 ring-navy-500/30' : ''}`}>
                                    {isEditingRaw ? (
                                        <textarea
                                            value={rawTextEdit}
                                            onChange={(e) => setRawTextEdit(e.target.value)}
                                            className="w-full h-full bg-transparent text-sm font-mono text-white/90 whitespace-pre-wrap leading-loose outline-none border-none resize-none custom-scrollbar"
                                            spellCheck={false}
                                            placeholder="Enter document text manually..."
                                        />
                                    ) : record.rawExtractedText ? (
                                        <div className="relative">
                                            <div className="absolute -top-3 -right-3 p-1.5 bg-slate-800/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(record.rawExtractedText);
                                                        toast.success('Copied to clipboard!');
                                                    }}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <pre className="text-sm font-mono text-slate-300 leading-relaxed break-words font-medium selection:bg-navy-500/30 selection:text-white">
                                                {record.rawExtractedText}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-40">
                                            <FileText className="w-16 h-16" />
                                            <p className="text-sm font-display tracking-wide uppercase font-bold">No Content Detected</p>
                                        </div>
                                    )}
                                </div>

                                {translations[targetLang] && !isEditingRaw && (
                                    <div className="bg-emerald-500/5 p-8 rounded-2xl border border-emerald-500/10 min-h-[250px] relative animate-slide-up shadow-xl overflow-hidden">
                                        <div className="absolute top-0 right-0 px-5 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-emerald-500/20 backdrop-blur-md">
                                            {targetLang} Context
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                                            Translated Output
                                            <div className="h-px bg-gradient-to-r from-emerald-500/20 to-transparent flex-1"></div>
                                        </div>
                                        <pre className="text-sm font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed break-words font-medium selection:bg-emerald-500/30 selection:text-white">
                                            {translations[targetLang]}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
