import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const STEPS = [
    'File Uploaded',
    'Running OCR (Google Vision)',
    'Detecting Language',
    'Extracting Fields (Gemini AI)',
    'Saving to Database'
];

export default function UploadProgress({ status, recordId, error }) {
    // Mapping API statuses to our timeline steps
    const getStepIndex = () => {
        switch (status) {
            case 'uploaded': return 0;
            case 'ocr_processing': return 1;
            case 'ocr_complete': return 2;
            case 'extracting': return 3;
            case 'complete': return 5;
            case 'failed': return -1;
            default: return 0;
        }
    };

    const currentIndex = getStepIndex();
    const isFailed = status === 'failed';

    if (!status) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-card">
            <h3 className="text-lg font-medium text-white mb-6">Processing Timeline</h3>

            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-800">
                {STEPS.map((step, idx) => {
                    const isCompleted = currentIndex > idx || currentIndex === 5;
                    const isCurrent = currentIndex === idx;
                    const localFailed = isFailed && (idx === currentIndex || (currentIndex === -1 && idx === 0));

                    let Icon = Loader2;
                    let colorClass = "text-slate-500 bg-slate-900";
                    let iconClass = "";

                    if (isCompleted) {
                        Icon = CheckCircle;
                        colorClass = "text-emerald-500 bg-slate-900";
                    } else if (isCurrent) {
                        Icon = Loader2;
                        colorClass = "text-navy-400 bg-slate-900";
                        iconClass = "animate-spin";
                    } else if (localFailed) {
                        Icon = XCircle;
                        colorClass = "text-red-500 bg-slate-900";
                    }

                    return (
                        <div key={step} className={clsx("flex items-center gap-4 relative z-10 transition-opacity", !isCompleted && !isCurrent && !localFailed && "opacity-50")}>
                            <div className={clsx("p-0.5 rounded-full", colorClass)}>
                                <Icon className={clsx("w-5 h-5", iconClass)} />
                            </div>
                            <span className={clsx("text-sm font-medium", isCompleted ? "text-slate-300" : isCurrent ? "text-white" : localFailed ? "text-red-400" : "text-slate-500")}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            {isFailed && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-sm text-red-400 font-medium">Processing Failed</p>
                    <p className="text-xs text-red-300 mt-1">{error || 'An unknown error occurred during document processing.'}</p>
                </div>
            )}

            {currentIndex === 5 && recordId && (
                <div className="mt-8 animate-slide-up">
                    <Link
                        to={`/records/${recordId}`}
                        className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Complete — View Record
                    </Link>
                </div>
            )}
        </div>
    );
}
