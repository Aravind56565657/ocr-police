import React, { useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import LanguageTag from '../records/LanguageTag';

export default function RawTextPanel({ rawText, languages, lowConfidenceWords }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(rawText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
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
                        className="flex items-center gap-2 px-3 py-1.5 bg-navy-600 hover:bg-navy-500 text-white text-xs font-medium rounded transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Re-process
                    </button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <pre className="font-mono text-xs whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {rawText || 'No text extracted.'}
                </pre>
            </div>
        </div>
    );
}
