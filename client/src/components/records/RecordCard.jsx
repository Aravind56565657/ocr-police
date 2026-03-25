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
        <Link to={`/records/${record._id}`} className="block group animate-slide-up h-full">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-navy-900/40 hover:border-navy-500/40 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden group">

                {/* Decorative background glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-navy-600/10 blur-3xl rounded-full group-hover:bg-navy-600/20 transition-all duration-700"></div>

                <div className="flex items-start justify-between mb-6">
                    <Badge variant="primary" className="bg-navy-500/10 border-navy-500/20 text-navy-400 font-bold uppercase text-[10px] tracking-widest px-3 py-1">
                        {documentType}
                    </Badge>
                    {requiresManualReview && (
                        <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            Review
                        </div>
                    )}
                </div>

                <div className="flex-1 mb-6">
                    <h3 className="text-xl font-display font-black text-white mb-2 group-hover:text-navy-400 transition-colors uppercase tracking-tight line-clamp-1">
                        {name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">{caseNo}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-wrap">
                        {(detectedLanguages || []).slice(0, 2).map((lang, idx) => (
                            <div key={idx} className="px-2 py-0.5 rounded-md bg-slate-950/40 border border-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {lang.languageName}
                            </div>
                        ))}
                        {(detectedLanguages || []).length > 2 && (
                            <span className="text-[10px] font-black text-slate-600 self-center">+{(detectedLanguages || []).length - 2}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-800/40">
                    <div className="flex items-center gap-3">
                        <ConfidenceBadge confidence={overallOCRConfidence} showLabel={false} size="sm" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{Math.round((overallOCRConfidence || 0) * 100)}% Match</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center group-hover:bg-navy-600 group-hover:border-navy-500 group-hover:shadow-lg group-hover:shadow-navy-900/40 transition-all duration-300">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                </div>

            </div>
        </Link>
    );
}
