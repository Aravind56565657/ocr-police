import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';
import LanguageTag from './LanguageTag';
import Badge from '../ui/Badge';

export default function RecordCard({ record }) {
    const { officerDetails, caseDetails, documentType, detectedLanguages, requiresManualReview, overallOCRConfidence } = record;
    const name = officerDetails?.name?.value || 'Unknown Officer';
    const caseNo = caseDetails?.caseNumber?.value || 'No Case #';

    return (
        <Link to={`/records/${record._id}`} className="block group">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 transition-all hover:shadow-card-hover hover:border-slate-700 flex flex-col h-full">

                <div className="flex items-start justify-between mb-4">
                    <Badge variant="primary">{documentType}</Badge>
                    {requiresManualReview && (
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-medium bg-amber-500/10 px-2 py-1 rounded">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Needs Review
                        </div>
                    )}
                </div>

                <div className="flex-1 mb-4">
                    <h3 className="text-lg font-display font-medium text-white mb-1 group-hover:text-navy-400 transition-colors">
                        {name}
                    </h3>
                    <p className="text-sm text-slate-400 font-mono mb-3">{caseNo}</p>

                    <div className="flex flex-wrap gap-2">
                        {detectedLanguages.slice(0, 3).map(lang => (
                            <LanguageTag key={lang.languageCode} languageName={lang.languageName} />
                        ))}
                        {detectedLanguages.length > 3 && (
                            <span className="text-xs text-slate-500">+{detectedLanguages.length - 3}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                    <ConfidenceBadge confidence={overallOCRConfidence} showLabel={false} />
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-navy-600 transition-colors">
                        <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                </div>

            </div>
        </Link>
    );
}
