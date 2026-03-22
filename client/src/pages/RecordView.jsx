import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EditableField from '../components/records/EditableField';
import ConfidenceBadge from '../components/records/ConfidenceBadge';
import OCRViewer from '../components/ocr/OCRViewer';
import RawTextPanel from '../components/ocr/RawTextPanel';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function RecordView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadRecord = async () => {
        try {
            const res = await api.get(`/records/${id}`);
            setRecord(res.data.record);
        } catch (err) {
            toast.error('Failed to load record');
            navigate('/records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecord();
    }, [id]);

    const markReviewed = async () => {
        try {
            await api.patch(`/records/${id}/review`);
            setRecord({ ...record, requiresManualReview: false });
            toast.success('Record marked as reviewed');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner className="w-8 h-8 text-navy-500" /></div>;
    if (!record) return null;

    return (
        <div className="h-full flex flex-col animate-fade-in -m-6 p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-display font-bold text-white flex items-center gap-3">
                            {record.originalFileName || 'Document'}
                            {record.requiresManualReview && <Badge variant="warning">Needs Review</Badge>}
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Uploaded {new Date(record.uploadedAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Clock className="w-4 h-4" /> Edit History
                    </Button>
                    {record.requiresManualReview && (
                        <Button size="sm" onClick={markReviewed} className="bg-emerald-600 hover:bg-emerald-500 gap-2">
                            <CheckCircle className="w-4 h-4" /> Mark Reviewed
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">

                {/* Left Panel: Original Document */}
                <div className="h-[800px] lg:h-full lg:col-span-1 shadow-card rounded-lg border border-slate-800 flex flex-col bg-slate-900 overflow-hidden">
                    <div className="bg-slate-800/80 p-3 border-b border-slate-800 flex justify-between items-center z-10">
                        <h2 className="text-sm font-medium text-white px-2">Original Document</h2>
                        <Badge variant="default" className="text-[10px]">{record.fileType.toUpperCase()}</Badge>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <OCRViewer fileUrl={record.originalFileUrl} fileType={record.fileType} />
                    </div>
                </div>

                {/* Center Panel: Structured Data */}
                <div className="lg:col-span-1 flex flex-col h-full overflow-y-auto bg-slate-900 rounded-lg border border-slate-800 shadow-card">
                    <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                        <h2 className="text-lg font-medium text-white">Extracted Information</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-slate-400">Total Confidence:</span>
                            <ConfidenceBadge confidence={record.overallOCRConfidence} size="md" />
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        <section>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-6 border-t border-slate-700"></span> Document Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-medium tracking-wide">Document Type</label>
                                    <EditableField value={record.documentType} fieldPath="documentType" recordId={record._id} fieldType="select" options={['FIR', 'Case Report', 'Officer Record', 'Incident Report', 'Duty Roster', 'Complaint', 'Witness Statement', 'Other']} />
                                </div>
                            </div>
                        </section>

                        {record.officerDetails && (
                            <section>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 border-t border-slate-700"></span> Officer Details
                                </h3>
                                <div className="grid grid-cols-1 gap-y-4 gap-x-6">
                                    {Object.entries(record.officerDetails).map(([key, data]) => {
                                        if (key === '_id') return null;
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        const fType = key.includes('Date') ? 'date' : 'text';

                                        return (
                                            <div key={key}>
                                                <label className="text-xs text-slate-400 font-medium tracking-wide">{formattedKey}</label>
                                                <EditableField
                                                    value={data?.value}
                                                    confidence={data?.confidence}
                                                    manuallyEdited={data?.manuallyEdited}
                                                    fieldPath={`officerDetails.${key}.value`}
                                                    recordId={record._id}
                                                    fieldType={fType}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {record.caseDetails && (
                            <section>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 border-t border-slate-700"></span> Case Details
                                </h3>
                                <div className="grid grid-cols-1 gap-y-4 gap-x-6">
                                    {Object.entries(record.caseDetails).map(([key, data]) => {
                                        if (key === '_id') return null;
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        const fType = key === 'description' ? 'textarea' : key.includes('Date') ? 'date' : key === 'status' ? 'select' : 'text';
                                        const opts = key === 'status' ? ['Open', 'Closed', 'Under Investigation', 'Pending', 'Unknown'] : [];

                                        return (
                                            <div key={key}>
                                                <label className="text-xs text-slate-400 font-medium tracking-wide">{formattedKey}</label>
                                                <EditableField
                                                    value={data?.value}
                                                    confidence={data?.confidence}
                                                    manuallyEdited={data?.manuallyEdited}
                                                    fieldPath={`caseDetails.${key}.value`}
                                                    recordId={record._id}
                                                    fieldType={fType}
                                                    options={opts}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Right Panel: Raw OCR */}
                <div className="h-[600px] lg:h-full lg:col-span-1 border border-slate-800 rounded-lg shadow-card bg-slate-900">
                    <RawTextPanel
                        rawText={record.rawExtractedText}
                        languages={record.detectedLanguages}
                        lowConfidenceWords={record.lowConfidenceWords}
                    />
                </div>

            </div>
        </div>
    );
}
