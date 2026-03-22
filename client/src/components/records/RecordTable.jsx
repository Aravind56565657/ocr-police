import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import ConfidenceBadge from './ConfidenceBadge';

export default function RecordTable({ records }) {
    if (!records.length) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs text-slate-400 bg-slate-800/50 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Officer Name</th>
                            <th className="px-6 py-4 font-medium">Badge No</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Confidence</th>
                            <th className="px-6 py-4 font-medium">Status / Review</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {records.map((record) => {
                            const name = record.officerDetails?.name?.value || 'Unknown';
                            const badge = record.officerDetails?.badgeNumber?.value || '-';

                            return (
                                <tr key={record._id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white">{name}</td>
                                    <td className="px-6 py-4 font-mono text-slate-400">{badge}</td>
                                    <td className="px-6 py-4"><Badge variant="primary">{record.documentType}</Badge></td>
                                    <td className="px-6 py-4">
                                        <ConfidenceBadge confidence={record.overallOCRConfidence} showLabel={false} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.requiresManualReview ? (
                                            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                                                <ShieldAlert className="w-4 h-4" /> Needs Review
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">Processed</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/records/${record._id}`}
                                            className="inline-flex items-center gap-1 text-navy-400 hover:text-navy-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            View <ChevronRight className="w-4 h-4" />
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
