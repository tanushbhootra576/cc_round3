import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    BarChart3, Activity, Users, ShieldCheck, Flame,
    ChevronRight, TrendingUp, AlertTriangle, ArrowLeft,
    Calendar, Map as MapIcon, RefreshCw, BarChart
} from 'lucide-react';

export default function GovAnalytics() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [kavachData, setKavachData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [overview, kavach] = await Promise.all([
                api.get('/analytics/overview'),
                api.get('/analytics/kavach-overview')
            ]);
            setData(overview.data);
            setKavachData(kavach.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="mono text-xs animate-pulse tracking-widest text-gray-400">LOADING_ANALYTICS...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/gov-dashboard')} className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
                            <ArrowLeft size={16} className="text-gray-500" />
                        </button>
                        <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                            <BarChart3 size={14} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">City Intelligence Analytics</h1>
                            <p className="mono text-[10px] text-gray-400 tracking-widest uppercase">Government Decision Support Platform</p>
                        </div>
                    </div>
                    <button onClick={fetchAnalytics} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-sm mono text-[10px] hover:bg-gray-50">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> REFRESH
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'RESOLUTION RATE', value: `${data?.resolutionRate}%`, sub: 'Current month', icon: TrendingUp, color: 'text-green-600', border: 'border-l-green-500' },
                        { label: 'AVG RESPONSE', value: `${data?.avgResponseDays} days`, sub: 'Target: 3 days', icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
                        { label: 'AVG SEVERITY', value: data?.avgSeverityScore?.toFixed(1), sub: 'Out of 100', icon: Activity, color: 'text-amber-600', border: 'border-l-amber-500' },
                        { label: 'ACTIVE ALERTS', value: data?.activeAlerts, sub: 'Traffic/Utility', icon: AlertTriangle, color: 'text-red-600', border: 'border-l-red-500' },
                    ].map((kpi, i) => (
                        <div key={i} className={`bg-white border border-gray-200 rounded-sm p-5 border-l-4 ${kpi.border}`}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="mono text-[10px] text-gray-400 tracking-widest">{kpi.label}</p>
                                <kpi.icon size={14} className={kpi.color} />
                            </div>
                            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase">{kpi.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* City Resilience Index (CHI) */}
                    <div className="bg-gray-900 border border-gray-800 rounded-sm p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                        <h3 className="text-sm font-bold mb-6 uppercase tracking-tight flex items-center gap-2">
                            <ShieldCheck size={16} className="text-blue-400" /> City Resilience (CHI)
                        </h3>
                        <div className="flex flex-col items-center">
                            <div className="w-40 h-40 rounded-full border-[10px] border-gray-800 flex items-center justify-center relative shadow-inner">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="80" cy="80" r="72"
                                        fill="transparent"
                                        stroke="#1d4ed8"
                                        strokeWidth="10"
                                        strokeDasharray={2 * Math.PI * 72}
                                        strokeDashoffset={2 * Math.PI * 72 * (1 - (kavachData?.cityHealthIndex || 0) / 100)}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="text-center z-10">
                                    <p className="text-4xl font-black text-white mono mb-1">{kavachData?.cityHealthIndex || 0}</p>
                                    <p className="mono text-[8px] text-gray-400 font-bold uppercase tracking-widest">Aggregate Index</p>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                <div className="bg-white/5 p-3 rounded-sm border border-white/10">
                                    <p className="mono text-[8px] text-gray-500 uppercase">Wards Active</p>
                                    <p className="text-xl font-bold mono text-emerald-400">{kavachData?.wardCount || 10}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-sm border border-white/10">
                                    <p className="mono text-[8px] text-gray-500 uppercase">System Status</p>
                                    <p className="text-xs font-bold mono text-blue-400">NOMINAL</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resource Utilization Forecast */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                                <TrendingUp size={16} className="text-emerald-600" /> Real-time Resource Demand
                            </h3>
                            <span className="mono text-[9px] px-2 py-0.5 bg-gray-100 text-gray-400 font-bold rounded-sm">LIVE SENSOR FEED</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {kavachData?.resourceAverages && Object.entries(kavachData.resourceAverages).map(([res, val]) => (
                                <div key={res} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="mono text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{res} Average Load</span>
                                        <span className={`mono text-[10px] font-black ${val > 80 ? 'text-red-500' : 'text-blue-600'}`}>{val}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${val > 80 ? 'bg-red-500' : 'bg-blue-600'} transition-all duration-1000 ease-out`}
                                            style={{ width: `${val}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] mono text-gray-400 uppercase">
                                        <span>Current: {val}%</span>
                                        <span>Limit: 100%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Congestion Hotspots */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Flame size={16} className="text-orange-600" /> Active Traffic Hotspots
                        </h3>
                        <div className="divide-y divide-gray-100">
                            {data?.congestionZones?.length === 0 ? (
                                <p className="py-8 text-center mono text-[10px] text-gray-400">NO ACTIVE CONGESTION</p>
                            ) : data?.congestionZones?.map((zone, i) => (
                                <div key={i} className="py-3 flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className="mono text-[10px] text-gray-400 w-4">{i + 1}</span>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">{zone._id || 'Unknown Ward'}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">{zone.count} Active Alerts</p>
                                        </div>
                                    </div>
                                    <span className={`mono text-[10px] px-2 py-0.5 rounded-sm font-bold ${zone.latestSeverity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {zone.latestSeverity?.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                            <MapIcon size={16} className="text-indigo-600" /> Ward-Level Issue Density
                        </h3>
                        <div className="space-y-2">
                            {data?.zoneHotspots?.slice(0, 6).map((zone, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-sm">
                                    <div className="w-8 h-8 rounded-sm bg-indigo-100 text-indigo-600 flex items-center justify-center mono text-xs font-bold">
                                        {zone.count}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 truncate">{zone._id}</p>
                                        <p className="text-[10px] text-gray-400 mono">LAT: {zone.avgLat?.toFixed(3)} LNG: {zone.avgLng?.toFixed(3)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
