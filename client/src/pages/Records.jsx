import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RecordTable from '../components/records/RecordTable';
import RecordCard from '../components/records/RecordCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { LayoutGrid, List, ShieldAlert } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto pt-8 px-6 flex flex-col h-full animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-600 flex items-center justify-center shadow-lg shadow-navy-900/40">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-display font-black text-white tracking-tight">Records Registry</h1>
                    </div>
                    <p className="text-slate-400 font-medium max-w-md">Secure digital archive of processed police documentation and OCR intelligence.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/40 backdrop-blur-sm">
                    <div className="relative group flex-1 sm:w-64">
                        <input
                            type="text"
                            placeholder="Search classifications..."
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800/80 text-white text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:border-navy-500/50 focus:ring-4 focus:ring-navy-500/10 transition-all placeholder:text-slate-600 shadow-inner"
                        />
                    </div>

                    <div className="h-8 w-[1px] bg-slate-800/60 hidden sm:block"></div>

                    <div className="flex items-center bg-slate-950/40 rounded-xl p-1 border border-slate-800/60 shadow-inner">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-navy-600 text-white shadow-lg shadow-navy-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <List className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Registry</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-navy-600 text-white shadow-lg shadow-navy-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Catalog</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <Spinner className="w-12 h-12 text-navy-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Archive...</span>
                </div>
            ) : records.length === 0 ? (
                <div className="mt-12 group animate-slide-up">
                    <div className="bg-slate-900/30 backdrop-blur-md rounded-3xl border border-dashed border-slate-800 p-20 flex flex-col items-center justify-center text-center transition-all hover:border-navy-500/40 hover:bg-navy-500/5">
                        <EmptyState
                            title="No Entries Found"
                            description="The registry matches no current filters. Clear parameters to refresh the view."
                            action={<Button onClick={() => { setDocumentType(''); setLanguage(''); }} variant="outline" className="mt-4 border-navy-500/40 text-navy-400 hover:bg-navy-500/10">Purge Filters</Button>}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col animate-slide-up">
                    {viewMode === 'table' ? (
                        <RecordTable records={records} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {records.map(r => <RecordCard key={r._id} record={r} />)}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-6 mt-12 pb-12">
                            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => loadRecords(page - 1)} className="text-slate-500 hover:text-white disabled:opacity-20 font-black uppercase text-[10px] tracking-[0.2em]">
                                Prev
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] w-8 bg-slate-800"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    Sector {page} <span className="text-slate-600">/</span> {totalPages}
                                </span>
                                <div className="h-[1px] w-8 bg-slate-800"></div>
                            </div>
                            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => loadRecords(page + 1)} className="text-slate-500 hover:text-white disabled:opacity-20 font-black uppercase text-[10px] tracking-[0.2em]">
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
