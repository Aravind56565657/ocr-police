import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, FileText, CheckCircle2, History, RotateCcw, Copy, Code2, Pencil, Check, X } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'raw'

    // Raw Text Editing State
    const [isEditingRaw, setIsEditingRaw] = useState(false);
    const [rawTextEdit, setRawTextEdit] = useState('');
    const [isSavingRaw, setIsSavingRaw] = useState(false);

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

    const handleFieldUpdate = (section, field, value) => {
        if (section === 'root') {
            setRecord(prev => ({ ...prev, [field]: value }));
            return;
        }
        setRecord(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: {
                    ...prev[section][field],
                    value
                }
            }
        }));
    };

    const handleSavePrimary = async () => {
        try {
            setIsSaving(true);
            await api.put(`/records/${id}`, {
                officerDetails: record.officerDetails,
                caseDetails: record.caseDetails,
                documentType: record.documentType,
                requiresManualReview: false
            });
            toast.success('Record updated successfully');
            await loadRecord();
        } catch (err) {
            toast.error('Failed to save updates');
        } finally {
            setIsSaving(false);
        }
    };

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

    // Add reprocessing state
    const [isReprocessing, setIsReprocessing] = useState(false);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!record) return null;

    const renderSection = (title, sectionData, sectionKey) => (
        <div className="mb-8 last:mb-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-4">
                {title}
                <div className="h-px bg-slate-800 flex-1"></div>
            </h3>
            <div className="space-y-4">
                {Object.entries(sectionData).map(([key, field]) => {
                    if (key === '_id' || typeof field !== 'object' || !field.hasOwnProperty('value')) return null;
                    return (
                        <EditableField
                            key={key}
                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            value={field.value || ''}
                            confidence={field.confidence}
                            fieldPath={`${sectionKey}.${key}.value`}
                            recordId={record._id}
                            fieldType={key.includes('Date') ? 'date' : 'text'}
                            onChange={(val) => handleFieldUpdate(sectionKey, key, val)}
                        />
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-h-screen flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-3">
                            {record.originalFileName || 'Unknown File'}
                            {record.requiresManualReview && (
                                <Badge variant="warning" icon={AlertTriangle}>Review Needed</Badge>
                            )}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Uploaded {new Date(record.createdAt || record.uploadedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" icon={History}>
                        Edit History
                    </Button>
                    <Button
                        variant="primary"
                        icon={Save}
                        onClick={handleSavePrimary}
                        isLoading={isSaving || isReprocessing}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Main Content - 2 Columns (50/50) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">

                {/* Left: Original Document */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-xl h-[calc(100vh-14rem)] overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur z-10">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Original Document
                        </h2>
                        <Badge variant="secondary" className="uppercase">{record.fileType}</Badge>
                    </div>
                    <div className="flex-1 bg-black/40 relative overflow-hidden">
                        <OCRViewer fileUrl={record.originalFileUrl} fileType={record.fileType} />
                    </div>
                </div>

                {/* Right: Tabbed Data Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-xl h-[calc(100vh-14rem)] overflow-hidden">

                    {/* Tabs Configuration */}
                    <div className="flex items-center border-b border-slate-800 px-2 bg-slate-900/95 backdrop-blur z-10">
                        <button
                            onClick={() => setActiveTab('fields')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fields'
                                ? 'border-navy-500 text-navy-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Structured Fields
                        </button>
                        <button
                            onClick={() => setActiveTab('raw')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'raw'
                                ? 'border-emerald-500 text-emerald-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
                                }`}
                        >
                            <Code2 className="w-4 h-4" />
                            Raw Text
                        </button>
                    </div>

                    {/* Tab Content Display */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                        {/* Tab 1: Extracted Fields */}
                        {activeTab === 'fields' && (
                            <div className="space-y-8 animate-fade-in relative">
                                {isReprocessing && (
                                    <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                )}
                                <div className="flex items-center justify-between bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
                                    <span className="text-sm font-medium text-slate-400">Total OCR Confidence:</span>
                                    <ConfidenceBadge confidence={record.overallOCRConfidence} size="md" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-4">
                                        Document Metadata
                                        <div className="h-px bg-slate-800 flex-1"></div>
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2 mt-2 tracking-wide">Document Classification</label>
                                        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
                                            <EditableField
                                                value={record.documentType}
                                                fieldPath="documentType"
                                                recordId={record._id}
                                                fieldType="select"
                                                options={['FIR', 'Case Report', 'Officer Record', 'Incident Report', 'Duty Roster', 'Complaint', 'Witness Statement', 'Other']}
                                                onUpdate={(path, val) => handleFieldUpdate('root', 'documentType', val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {renderSection('Officer Details', record.officerDetails || {}, 'officerDetails')}
                                {renderSection('Case Details', record.caseDetails || {}, 'caseDetails')}
                            </div>
                        )}

                        {/* Tab 2: Raw Text Source */}
                        {activeTab === 'raw' && (
                            <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
                                {isReprocessing && (
                                    <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                )}
                                <div className="flex items-center justify-between bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detected Languages</span>
                                        <div className="flex flex-wrap gap-2">
                                            {record.detectedLanguages?.map((lang, i) => (
                                                <LanguageTag key={i} language={lang.languageName} confidence={lang.confidence} />
                                            ))}
                                        </div>
                                    </div>

                                    {!isEditingRaw ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600"
                                                title="Edit raw text"
                                                onClick={() => setIsEditingRaw(true)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600"
                                                title="Copy full raw text"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(record.rawExtractedText);
                                                    toast.success('Raw text copied to clipboard!');
                                                }}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleReprocessOCR} isLoading={isReprocessing}>
                                                Re-Run OCR
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 rounded-lg transition-colors border border-emerald-500/30"
                                                title="Save raw text changes"
                                                onClick={handleSaveRawText}
                                                disabled={isSavingRaw}
                                            >
                                                {isSavingRaw ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button
                                                className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
                                                title="Cancel editing"
                                                onClick={() => {
                                                    setIsEditingRaw(false);
                                                    setRawTextEdit(record.rawExtractedText);
                                                }}
                                                disabled={isSavingRaw}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 bg-[#0a0f18] rounded-xl border border-slate-800 p-6 overflow-y-auto custom-scrollbar shadow-inner relative group">
                                    {isEditingRaw ? (
                                        <textarea
                                            value={rawTextEdit}
                                            onChange={(e) => setRawTextEdit(e.target.value)}
                                            className="w-full h-full bg-transparent text-sm font-mono text-white/90 whitespace-pre-wrap leading-relaxed outline-none border-none resize-none custom-scrollbar"
                                            spellCheck={false}
                                        />
                                    ) : record.rawExtractedText ? (
                                        <pre className="text-sm font-mono text-slate-300/90 whitespace-pre-wrap leading-relaxed break-words font-medium">
                                            {record.rawExtractedText}
                                        </pre>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                                            <FileText className="w-10 h-10 opacity-20" />
                                            <p className="text-sm cursor-default">No raw text was able to be extracted from this document.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
