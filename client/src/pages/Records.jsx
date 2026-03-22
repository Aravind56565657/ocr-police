import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RecordTable from '../components/records/RecordTable';
import RecordCard from '../components/records/RecordCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { LayoutGrid, List } from 'lucide-react';

export default function Records() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [documentType, setDocumentType] = useState('');
    const [language, setLanguage] = useState('');

    const loadRecords = async (pageNum = 1) => {
        setLoading(true);
        try {
            let url = `/records?page=${pageNum}&limit=12`;
            if (documentType) url += `&documentType=${documentType}`;
            if (language) url += `&language=${language}`;

            const res = await api.get(url);
            setRecords(res.data?.records || []);
            setTotalPages(res.data?.pages || 1);
            setPage(res.data?.page || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords(1);
    }, [documentType, language]);

    return (
        <div className="max-w-7xl mx-auto pt-4 flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-1">Police Records</h1>
                    <p className="text-sm text-slate-400">Manage and review all digitized documents</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-navy-500 shadow-card"
                    >
                        <option value="">All Types</option>
                        <option value="FIR">FIR</option>
                        <option value="Case Report">Case Report</option>
                        <option value="Incident Report">Incident Report</option>
                    </select>

                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-1 shadow-card">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center"><Spinner className="w-8 h-8 text-navy-500" /></div>
            ) : records.length === 0 ? (
                <div className="mt-12 bg-slate-900/50 rounded-lg border border-slate-800"><EmptyState title="No records found" description="Try adjusting your filters or upload a new record." action={<Button onClick={() => { setDocumentType(''); setLanguage(''); }}>Clear Filters</Button>} /></div>
            ) : (
                <div className="flex-1 flex flex-col">
                    {viewMode === 'table' ? (
                        <RecordTable records={records} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {records.map(r => <RecordCard key={r._id} record={r} />)}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => loadRecords(page - 1)}>Previous</Button>
                            <span className="text-sm font-medium text-slate-400 px-4">Page {page} of {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => loadRecords(page + 1)}>Next</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
