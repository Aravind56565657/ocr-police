import React from 'react';

export default function SearchFilters({ filters, setFilters }) {
    const handleToggle = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 sticky top-24">
            <h3 className="font-medium text-white mb-4">Filters</h3>

            <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Confidence</h4>
                    <div className="space-y-2">
                        {['All', 'High', 'Medium', 'Needs Review'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="confidence"
                                    checked={filters.confidence === opt}
                                    onChange={() => handleToggle('confidence', opt)}
                                    className="w-4 h-4 text-navy-600 bg-slate-800 border-slate-700 rounded focus:ring-navy-600 focus:ring-2"
                                />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Document Type</h4>
                    <select
                        value={filters.type}
                        onChange={(e) => handleToggle('type', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-navy-500 outline-none"
                    >
                        <option value="All">All Types</option>
                        <option value="FIR">FIR</option>
                        <option value="Case Report">Case Report</option>
                        <option value="Incident Report">Incident Report</option>
                        <option value="Officer Record">Officer Record</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
