import React, { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Globe, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RecordTable from '../components/records/RecordTable';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, review: 0, languages: 0, today: 0 });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const res = await api.get('/records?limit=5');
                const records = res.data?.records || [];
                setRecent(records);

                const reviewCount = records.filter(r => r.requiresManualReview).length;
                const langSet = new Set();
                records.forEach(r => r.detectedLanguages.forEach(l => langSet.add(l.languageCode)));

                setStats({
                    total: res.data?.total || 0,
                    review: reviewCount,
                    languages: langSet.size || 3,
                    today: records.length
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner className="w-8 h-8 text-navy-500" /></div>;

    const statCards = [
        { label: 'Total Records Digitized', value: stats.total, icon: FileText, color: 'text-blue-500' },
        { label: 'Requires Review', value: stats.review, icon: ShieldAlert, color: 'text-amber-500', alert: true },
        { label: 'Languages Detected', value: stats.languages, icon: Globe, color: 'text-emerald-500' },
        { label: 'Processed Today', value: stats.today, icon: Activity, color: 'text-purple-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
                <Link to="/upload" className="bg-navy-600 hover:bg-navy-500 text-white px-5 py-2.5 rounded font-medium transition-colors shadow-lg shadow-navy-900/20">
                    Quick Upload
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-card flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-slate-800 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                            <h4 className={`text-2xl font-bold ${stat.alert && stat.value > 0 ? 'text-amber-500' : 'text-white'}`}>
                                {stat.value}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-white">Recent Uploads</h2>
                    <Link to="/records" className="text-sm text-navy-400 hover:text-navy-300 flex items-center gap-1 font-medium transition-colors">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recent.length > 0 ? (
                    <RecordTable records={recent} />
                ) : (
                    <EmptyState title="No records yet" description="Upload a handwritten police document to get started." />
                )}
            </div>
        </div>
    );
}
