import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Wallet, TrendingDown, TrendingUp, AlertCircle,
    ArrowLeft, RefreshCw, Layers, PieChart,
    ArrowRight, ShieldAlert, CheckCircle2, DollarSign
} from 'lucide-react';

export default function GovBudget() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [budgetRes, aiRes] = await Promise.all([
                api.get('/analytics/budget'),
                api.get('/analytics/ai-recommendations')
            ]);
            setData(budgetRes.data);
            setAiRecommendations(aiRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="mono text-xs animate-pulse tracking-widest text-gray-400">LOADING_BUDGET_ANALYSIS...</div>
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
                        <div className="w-8 h-8 bg-emerald-600 rounded-sm flex items-center justify-center">
                            <Wallet size={14} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Budget Allocation Engine</h1>
                            <p className="mono text-[10px] text-gray-400 tracking-widest uppercase">Smart Resource Planning & AI Auditing</p>
                        </div>
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-sm mono text-[10px] hover:bg-gray-50">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> REFRESH
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Total Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
                            <DollarSign size={24} className="text-emerald-200 mr-2 mb-2" />
                        </div>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mb-1">CITY BUDGET (EST.)</p>
                        <h2 className="text-3xl font-black text-gray-900">₹ {data.totalBudget} <span className="text-sm font-medium text-gray-400">LAKH</span></h2>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '70%' }} />
                            </div>
                            <span className="mono text-[10px] text-emerald-600 font-bold">70% UTILIZED</span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-sm p-6">
                        <p className="mono text-[10px] text-gray-400 tracking-widest mb-1">FUNDING DEMAND</p>
                        <h2 className="text-3xl font-black text-amber-600">₹ {data.totalDemand} <span className="text-sm font-medium text-gray-400">LAKH</span></h2>
                        <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase flex items-center gap-1">
                            <AlertCircle size={10} /> Gap of ₹ {(data.totalDemand - data.totalAllocated).toFixed(1)}L detected
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-sm p-6">
                        <p className="mono text-[10px] text-gray-400 tracking-widest mb-1">HEALTH SCORE</p>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-black text-blue-600">82.4</h2>
                            <div className="mb-1 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                <TrendingUp size={10} /> +2.1%
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase">Resource application efficiency</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Sector Analysis */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <PieChart size={14} className="text-blue-500" /> Sector-wise Funding vs Demand
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-3 mono text-gray-400 font-semibold">SECTOR</th>
                                        <th className="px-6 py-3 mono text-gray-400 font-semibold">ALLOTED</th>
                                        <th className="px-6 py-3 mono text-gray-400 font-semibold">DEMAND</th>
                                        <th className="px-6 py-3 mono text-gray-400 font-semibold">GAP</th>
                                        <th className="px-6 py-3 mono text-gray-400 font-semibold">EFFICIENCY</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.sectorFunding.map((sector, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    <span className="font-bold text-gray-800 uppercase">{sector.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600">₹{sector.allocated}L</td>
                                            <td className="px-6 py-4 font-medium text-gray-600">₹{sector.totalDemand}L</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${sector.isUnderfunded ? 'text-red-500' : 'text-green-600'}`}>
                                                    {sector.isUnderfunded ? `+ ₹${sector.gap}L` : 'OK'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="mono font-bold text-gray-700">{sector.efficiency}%</span>
                                                    <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${sector.efficiency}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-sm p-6">
                            <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                                <ShieldAlert size={14} className="text-purple-600" /> AI Spending Insights
                            </h3>
                            <div className="space-y-4">
                                {aiRecommendations?.budgetAdvice?.recommendations?.map((rec, i) => (
                                    <div key={i} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="mono text-[8px] px-1 bg-indigo-600 text-white rounded-sm">{rec.sector.toUpperCase()}</span>
                                            <span className="text-[10px] font-bold text-indigo-900">{rec.ward}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-indigo-900 leading-relaxed mb-2">
                                            {rec.recommendation}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="mono text-[8px] text-indigo-400 uppercase tracking-widest">{rec.reason}</span>
                                            <ArrowRight size={12} className="text-indigo-400" />
                                        </div>
                                    </div>
                                ))}
                                {(!aiRecommendations?.budgetAdvice?.recommendations || aiRecommendations.budgetAdvice.recommendations.length === 0) && (
                                    <p className="text-[10px] text-gray-400 mono text-center py-4">NO IMMEDIATE REDISTRIBUTION REQUIRED</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-sm p-6 text-white shadow-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <h3 className="text-xs font-bold uppercase tracking-tight">System Status</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] mono text-gray-400">
                                    <span>AUDIT_LOG_VERIFIED</span>
                                    <span className="text-emerald-400">SUCCESS</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] mono text-gray-400">
                                    <span>BUDGET_SYNC_ACTIVE</span>
                                    <span className="text-emerald-400">LIVE</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] mono text-gray-400">
                                    <span>LEAK_DETECTION</span>
                                    <span className="text-gray-500">0_ALERTS</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm mono text-[10px] transition-colors uppercase tracking-widest font-bold">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Zone Breakdown */}
                <div className="bg-white border border-gray-200 rounded-sm p-6">
                    <h3 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                        <Layers size={14} className="text-orange-500" /> Ward-Level Utilization Analysis
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {data.zoneBreakdown.slice(0, 16).map((zone, i) => (
                            <div key={i} className="text-center p-3 border border-gray-100 rounded-sm hover:border-gray-200 transition-colors">
                                <p className="mono text-[9px] text-gray-400 mb-1 truncate">{zone.zone.toUpperCase()}</p>
                                <p className={`text-sm font-bold ${zone.isOverbudget ? 'text-red-600' : 'text-gray-900'}`}>{zone.utilizationRate}%</p>
                                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${zone.isOverbudget ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(zone.utilizationRate, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
