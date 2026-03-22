import React, { useState, useEffect } from 'react';
import UploadZone from '../components/upload/UploadZone';
import UploadProgress from '../components/upload/UploadProgress';
import Button from '../components/ui/Button';
import { uploadFile } from '../services/api';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [currentUploadId, setCurrentUploadId] = useState(null);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [recordId, setRecordId] = useState(null);
    const { toast } = useToast();

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setStatus('uploaded');
        setError(null);
        setRecordId(null);

        const file = files[0];
        const formData = new FormData();
        formData.append('document', file);

        try {
            const res = await uploadFile('/upload/document', formData, (progressEvent) => { });

            const record = res.data?.record;
            if (record) {
                setCurrentUploadId(record.uploadId);
                setStatus(record.processingStatus);
                setRecordId(record._id);

                if (res.data?.warnings) {
                    toast.warning(res.data.warnings.message);
                } else {
                    toast.success('Document processed successfully');
                }
            }
        } catch (err) {
            console.error(err);
            setStatus('failed');
            setError(err.message || 'Failed to process document');
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (currentUploadId && status && status !== 'complete' && status !== 'failed') {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/upload/status/${currentUploadId}`);
                    const newStatus = res.data?.status;
                    setStatus(newStatus);
                    if (newStatus === 'complete' || newStatus === 'failed') {
                        if (newStatus === 'complete') setRecordId(res.data?.record?._id);
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [currentUploadId, status]);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in flex flex-col pt-4">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white mb-2">Upload Document</h1>
                <p className="text-slate-400">Upload handwritten police records for AI-powered processing. Supported formats: PDF, JPG, PNG, WEBP, TIFF.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-6">
                    <UploadZone files={files} setFiles={setFiles} />

                    <div className="flex justify-end">
                        <Button
                            size="lg"
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading || (status && status !== 'failed' && status !== 'complete')}
                            isLoading={uploading}
                            className="w-full sm:w-auto"
                        >
                            Start Processing
                        </Button>
                    </div>
                </div>

                <div className="lg:sticky lg:top-24">
                    {status ? (
                        <UploadProgress status={status} error={error} recordId={recordId} />
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 text-slate-500 shadow-card">
                            <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p>Upload a file to see processing timeline</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
