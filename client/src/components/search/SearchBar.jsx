import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function SearchBar({ initialQuery = '', onSearch }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/search/suggest?q=${encodeURIComponent(query)}`);
                setSuggestions(res.data?.data?.suggestions || res.data?.suggestions || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (onSearch) onSearch(query);
    };

    return (
        <div className="relative w-full mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                    className="w-full p-4 pl-12 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 font-medium shadow-card"
                    placeholder="Search by officer name, case number, location..."
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => setShowSuggestions(true)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    {isLoading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
                </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-16 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-800/50 uppercase tracking-wider">
                        Quick Jump Suggestions
                    </div>
                    <ul className="divide-y divide-slate-800">
                        {suggestions.map((s, i) => (
                            <li key={i}>
                                <button
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-3"
                                    onClick={() => {
                                        setQuery(s.text || s);
                                        setShowSuggestions(false);
                                        if (s.id) {
                                            navigate(`/records/${s.id}`);
                                        } else if (onSearch) {
                                            onSearch(s.text || s);
                                        }
                                    }}
                                >
                                    <Search className="w-4 h-4 text-slate-500" />
                                    {s.text || s}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
