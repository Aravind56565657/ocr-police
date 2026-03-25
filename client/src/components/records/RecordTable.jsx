import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import ConfidenceBadge from './ConfidenceBadge';

export default function RecordTable({ records }) {
    if (!records.length) return null;

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-slate-700/80">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/80">
                        <tr>
                            <th className="px-8 py-5">Officer / Identity</th>
                            <th className="px-6 py-5">Badge No</th>
                            <th className="px-6 py-5">Classification</th>
                            <th className="px-6 py-5">OCR Score</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 bg-slate-950/20">
                        {records.map((record) => {
                            const name = record.officerDetails?.name?.value || 'Unknown Officer';
                            const badge = record.officerDetails?.badgeNumber?.value || 'N/A';

                            return (
                                <tr key={record._id} className="hover:bg-navy-600/5 transition-all duration-300 group cursor-default">
                                    <td className="px-8 py-5 font-bold text-white group-hover:text-navy-400 transition-colors uppercase tracking-tight">{name}</td>
                                    <td className="px-6 py-5 font-mono text-slate-500 group-hover:text-slate-300 transition-colors">{badge}</td>
                                    <td className="px-6 py-5"><Badge variant="primary" className="bg-navy-500/10 border-navy-500/20 text-navy-400 font-bold uppercase text-[10px] tracking-widest">{record.documentType}</Badge></td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <ConfidenceBadge confidence={record.overallOCRConfidence} showLabel={false} size="sm" />
                                            <span className="text-[10px] font-bold text-slate-500">{Math.round((record.overallOCRConfidence || 0) * 100)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {record.requiresManualReview ? (
                                            <span className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                                                <ShieldAlert className="w-3.5 h-3.5" /> Needed
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
                                                Ready
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link
                                            to={`/records/${record._id}`}
                                            className="inline-flex items-center gap-2 text-navy-400 hover:text-white font-bold text-[10px] uppercase tracking-widest hover:bg-navy-600 px-4 py-1.5 rounded-lg transition-all active:scale-95 border border-navy-500/20 shadow-lg shadow-navy-900/10"
                                        >
                                            Open <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
