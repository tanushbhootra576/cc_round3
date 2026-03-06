import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AlertCard from '../components/AlertCard';
import {
    Radio, Bell, Filter, Megaphone, AlertTriangle, Zap, Droplets,
    Car, Construction, Wind, CloudRain, MoreHorizontal, RefreshCw,
    BarChart3, ShieldAlert, Clock, CheckCircle2,
} from 'lucide-react';

const CATEGORIES = ['', 'traffic', 'water', 'power', 'drainage', 'construction', 'pollution', 'other'];
const SEVERITIES = ['', 'info', 'warning', 'critical'];

const CAT_ICON_MAP = {
    traffic: Car, water: Droplets, power: Zap, drainage: CloudRain,
    construction: Construction, pollution: Wind, other: MoreHorizontal,
};

const PRIORITY_BADGE = {
    low: 'bg-gray-50 text-gray-600 border-gray-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
};

function timeAgo(date) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function CityFeed() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [summary, setSummary] = useState({ totalActiveAlerts: 0, totalAnnouncements: 0, alertsByCategory: [], alertsBySeverity: [] });
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState('');
    const [sevFilter, setSevFilter] = useState('');
    const [activeTab, setActiveTab] = useState('alerts');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (catFilter) params.set('category', catFilter);
            if (sevFilter) params.set('severity', sevFilter);

            const [alertsRes, announcementsRes, summaryRes] = await Promise.all([
                api.get(`/feed/alerts?${params}`),
                api.get('/feed/announcements'),
                api.get('/feed/summary'),
            ]);
            setAlerts(alertsRes.data || []);
            setAnnouncements(announcementsRes.data || []);
            setSummary(summaryRes.data || {});
        } finally {
            setLoading(false);
        }
    }, [catFilter, sevFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Real-time Socket.IO updates
    useEffect(() => {
        if (!socket) return;

        const handleNewAlert = (data) => {
            setAlerts(prev => [data, ...prev]);
            setSummary(prev => ({ ...prev, totalActiveAlerts: prev.totalActiveAlerts + 1 }));
        };
        const handleUpdatedAlert = (data) => {
            setAlerts(prev => prev.map(a => a._id === data._id ? data : a));
        };
        const handleResolvedAlert = (data) => {
            setAlerts(prev => prev.filter(a => a._id !== data._id));
            setSummary(prev => ({ ...prev, totalActiveAlerts: Math.max(0, prev.totalActiveAlerts - 1) }));
        };
        const handleNewAnnouncement = (data) => {
            setAnnouncements(prev => [data, ...prev]);
        };

        socket.on('city_alert_new', handleNewAlert);
        socket.on('city_alert_updated', handleUpdatedAlert);
        socket.on('city_alert_resolved', handleResolvedAlert);
        socket.on('announcement_new', handleNewAnnouncement);

        return () => {
            socket.off('city_alert_new', handleNewAlert);
            socket.off('city_alert_updated', handleUpdatedAlert);
            socket.off('city_alert_resolved', handleResolvedAlert);
            socket.off('announcement_new', handleNewAnnouncement);
        };
    }, [socket]);

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 pt-6 pb-16 max-w-6xl">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Radio size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">City Live Feed</h1>
                                <p className="text-sm text-gray-500">Real-time city alerts & government announcements</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={fetchData}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                {/* Live Summary Banner */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card rounded-xl p-5 border-l-4 border-l-red-500 hover:shadow-md transition-shadow fade-in">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <ShieldAlert size={20} className="text-red-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{summary.totalActiveAlerts}</p>
                        <p className="text-sm font-medium text-gray-900">Active Alerts</p>
                        <p className="text-xs text-gray-500">City-wide active issues</p>
                    </div>

                    <div className="card rounded-xl p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow fade-in" style={{ animationDelay: '0.05s' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-amber-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">{criticalCount}</p>
                        <p className="text-sm font-medium text-gray-900">Critical</p>
                        <p className="text-xs text-gray-500">Requires immediate attention</p>
                    </div>

                    <div className="card rounded-xl p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <BarChart3 size={20} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{warningCount}</p>
                        <p className="text-sm font-medium text-gray-900">Warnings</p>
                        <p className="text-xs text-gray-500">Monitor closely</p>
                    </div>

                    <div className="card rounded-xl p-5 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow fade-in" style={{ animationDelay: '0.15s' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Megaphone size={20} className="text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">{summary.totalAnnouncements}</p>
                        <p className="text-sm font-medium text-gray-900">Announcements</p>
                        <p className="text-xs text-gray-500">From city administration</p>
                    </div>
                </div>

                {/* Category Breakdown Chips */}
                {summary.alertsByCategory?.length > 0 && (
                    <div className="card rounded-xl p-5 mb-8 fade-in">
                        <p className="mono text-[10px] text-gray-400 tracking-widest mb-3 uppercase">Alerts by Category</p>
                        <div className="flex flex-wrap gap-2">
                            {summary.alertsByCategory.map(cat => {
                                const CatIcon = CAT_ICON_MAP[cat._id] || MoreHorizontal;
                                return (
                                    <button key={cat._id}
                                        onClick={() => setCatFilter(catFilter === cat._id ? '' : cat._id)}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${catFilter === cat._id
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}>
                                        <CatIcon size={14} />
                                        {cat._id.charAt(0).toUpperCase() + cat._id.slice(1)}
                                        <span className={`mono text-[10px] font-bold px-1.5 py-0.5 rounded-full ${catFilter === cat._id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {cat.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
                    <button onClick={() => setActiveTab('alerts')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'alerts'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}>
                        <AlertTriangle size={15} /> Active Alerts
                        <span className="mono text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">{alerts.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('announcements')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'announcements'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}>
                        <Megaphone size={15} /> Announcements
                        <span className="mono text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">{announcements.length}</span>
                    </button>
                </div>

                {/* ALERTS TAB */}
                {activeTab === 'alerts' && (
                    <div>
                        {/* Filters */}
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                            <Filter size={14} className="text-gray-400" />
                            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-white">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}</option>)}
                            </select>
                            <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-white">
                                {SEVERITIES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Severity'}</option>)}
                            </select>
                            {(catFilter || sevFilter) && (
                                <button onClick={() => { setCatFilter(''); setSevFilter(''); }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {/* Alert Cards */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-xl h-24" />)}
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="card rounded-xl p-12 text-center">
                                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">All Clear! 🎉</h3>
                                <p className="text-gray-600">No active city alerts right now. Everything looks good.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert, index) => (
                                    <div key={alert._id} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <AlertCard alert={alert} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ANNOUNCEMENTS TAB */}
                {activeTab === 'announcements' && (
                    <div>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-xl h-20" />)}
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="card rounded-xl p-12 text-center">
                                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Megaphone size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Announcements</h3>
                                <p className="text-gray-600">No government announcements at this time.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((ann, index) => (
                                    <div key={ann._id}
                                        className="card rounded-xl p-5 hover:shadow-md transition-all fade-in border-l-4"
                                        style={{
                                            animationDelay: `${index * 0.05}s`,
                                            borderLeftColor: ann.priority === 'critical' ? '#ef4444' : ann.priority === 'high' ? '#f59e0b' : ann.priority === 'medium' ? '#3b82f6' : '#9ca3af',
                                        }}>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                <Megaphone size={18} className="text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-gray-900">{ann.title}</h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${PRIORITY_BADGE[ann.priority]}`}>
                                                        {ann.priority}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
                                                        {ann.category}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2">{ann.body}</p>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-1"><Clock size={9} /> {timeAgo(ann.createdAt)}</span>
                                                    {ann.createdBy?.name && <span>by {ann.createdBy.name}</span>}
                                                    {ann.expiresAt && <span>Expires: {new Date(ann.expiresAt).toLocaleDateString('en-IN')}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
