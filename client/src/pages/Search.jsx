import React, { useState } from 'react';
import SearchBar from '../components/search/SearchBar';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [filters, setFilters] = useState({
        confidence: 'All',
        type: 'All'
    });

    const performSearch = async (searchQuery) => {
        if (!searchQuery) return;
        setQuery(searchQuery);
        setLoading(true);
        setHasSearched(true);

        try {
            const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
            setResults(res.data?.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r => {
        if (filters.type !== 'All' && r.documentType !== filters.type) return false;
        if (filters.confidence === 'Needs Review' && !r.requiresManualReview) return false;
        if (filters.confidence === 'High' && r.overallOCRConfidence < 0.8) return false;
        if (filters.confidence === 'Medium' && (r.overallOCRConfidence >= 0.8 || r.overallOCRConfidence < 0.6)) return false;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto flex flex-col min-h-full animate-fade-in pt-4">
            <div className="flex flex-col items-center mb-10 text-center">
                <h1 className="text-3xl font-display font-bold text-white mb-2">Global Search</h1>
                <p className="text-slate-400 mb-8 max-w-lg">Search across all extracted fields, officer names, and raw handwritten text across multiple languages.</p>
                <div className="w-full max-w-2xl px-4">
                    <SearchBar onSearch={performSearch} initialQuery={query} />
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6">
                {hasSearched ? (
                    <>
                        <div className="w-full md:w-64 shrink-0">
                            <SearchFilters filters={filters} setFilters={setFilters} />
                        </div>
                        <div className="flex-1">
                            {loading ? (
                                <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-navy-500" /></div>
                            ) : (
                                <SearchResults results={filteredResults} query={query} />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800">
                        <svg className="w-12 h-12 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p>Enter a query to begin searching</p>
                    </div>
                )}
            </div>
        </div>
    );
}
