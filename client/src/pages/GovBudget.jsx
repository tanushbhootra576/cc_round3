import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Wallet, TrendingDown, TrendingUp, AlertCircle,
    ArrowLeft, RefreshCw, Layers, PieChart,
    ArrowRight, ShieldAlert, CheckCircle2, DollarSign,
    Save, Edit3, X, Zap, Droplets, Car, Activity, Trash2, Wifi
} from 'lucide-react';

const SECTOR_ICONS = {
    power: Zap,
    water: Droplets,
    traffic: Car,
    sewage: Activity,
    waste: Trash2,
    internet: Wifi
};

export default function GovBudget() {
    const navigate = useNavigate();
    const [wards, setWards] = useState([]);
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({}); // { wardId: { sector: budget } }
    const [totalCityBudget, setTotalCityBudget] = useState(1500000); // Fixed pool for example

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [wardsRes, aiRes] = await Promise.all([
                api.get('/wards'),
                api.get('/analytics/ai-recommendations')
            ]);
            setWards(wardsRes.data);
            setAiRecommendations(aiRes.data);

            // Initialize edit state
            const initialEdit = {};
            wardsRes.data.forEach(w => {
                initialEdit[w._id] = { ...w.resources };
            });
            setEditData(initialEdit);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBudgetChange = (wardId, sector, value) => {
        setEditData(prev => ({
            ...prev,
            [wardId]: {
                ...prev[wardId],
                [sector]: { ...prev[wardId][sector], budget: parseInt(value) || 0 }
            }
        }));
    };

    const calculateAllocated = () => {
        return Object.values(editData).reduce((total, wardRes) => {
            return total + Object.values(wardRes).reduce((wTotal, s) => wTotal + (s.budget || 0), 0);
        }, 0);
    };

    const handleSaveAll = async () => {
        try {
            setLoading(true);
            await Promise.all(
                Object.entries(editData).map(([id, resources]) =>
                    api.patch(`/wards/${id}`, { resources })
                )
            );
            setIsEditing(false);
            fetchData();
        } catch (err) {
            alert('Failed to save budgets');
        } finally {
            setLoading(false);
        }
    };

    if (loading && wards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="mono text-xs animate-pulse tracking-widest text-gray-400">SYNCING_FISCAL_DATA...</div>
            </div>
        );
    }

    const currentAllocated = calculateAllocated();
    const remaining = totalCityBudget - currentAllocated;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/gov-dashboard')} className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
                            <ArrowLeft size={16} className="text-gray-500" />
                        </button>
                        <div className="w-8 h-8 bg-emerald-600 rounded-sm flex items-center justify-center">
                            <Wallet size={14} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 tracking-tighter uppercase">Fiscal Command Center</h1>
                            <p className="mono text-[10px] text-gray-400 tracking-widest uppercase">Smart Resource Planning & AI-Guided Allocation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-sm mono text-[10px] font-bold hover:bg-black transition-all"
                            >
                                <Edit3 size={12} /> ENTER ALLOCATION MODE
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setIsEditing(false); fetchData(); }}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-sm mono text-[10px] font-bold hover:bg-gray-50"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSaveAll}
                                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-sm mono text-[10px] font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                >
                                    <Save size={12} /> COMMIT CHANGES
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Budget Summary Bar */}
                <div className={`bg-gray-900 text-white rounded-sm p-6 shadow-2xl transition-all ${isEditing ? 'ring-2 ring-emerald-500 animate-pulse' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total City Pool</p>
                            <h2 className="text-3xl font-black mono tracking-tighter">₹ {(totalCityBudget / 100000).toFixed(1)} Cr</h2>
                        </div>
                        <div>
                            <p className="mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Allocated Funds</p>
                            <h2 className="text-3xl font-black mono tracking-tighter text-emerald-400">₹ {(currentAllocated / 100000).toFixed(2)} Cr</h2>
                        </div>
                        <div>
                            <p className="mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Remaining Balance</p>
                            <h2 className={`text-3xl font-black mono tracking-tighter ${remaining < 0 ? 'text-red-500' : 'text-blue-400'}`}>
                                ₹ {(remaining / 100000).toFixed(2)} Cr
                            </h2>
                        </div>
                    </div>
                    <div className="mt-6 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${remaining < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (currentAllocated / totalCityBudget) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Wards List with Sector Budgets */}
                    <div className="lg:col-span-3 space-y-4">
                        {wards.map((ward) => (
                            <div key={ward._id} className="bg-white border border-gray-200 rounded-sm p-6 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-gray-900 text-white mono text-[10px] font-bold rounded-sm uppercase">{ward.wardId}</span>
                                        <h3 className="font-black text-gray-900 uppercase tracking-tight">{ward.name}</h3>
                                        <span className="mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-sm">{ward.zone}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="mono text-[9px] text-gray-400 uppercase">Ward Total</p>
                                        <p className="font-bold text-gray-900 mono">₹ {(Object.values(editData[ward._id] || {}).reduce((a, b) => a + (b.budget || 0), 0) / 1000).toFixed(1)}k</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                    {Object.keys(ward.resources).map((sector) => {
                                        const Icon = SECTOR_ICONS[sector] || Activity;
                                        const budgetValue = editData[ward._id]?.[sector]?.budget || 0;
                                        const utilization = ward.resources[sector].utilization;

                                        return (
                                            <div key={sector} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                        <Icon size={12} className="text-gray-400" />
                                                        <span className="mono text-[9px] font-black text-gray-500 uppercase">{sector}</span>
                                                    </div>
                                                    <span className={`mono text-[8px] font-bold ${utilization > 80 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {Math.round(utilization)}% LOAD
                                                    </span>
                                                </div>

                                                {isEditing ? (
                                                    <div className="space-y-1">
                                                        <input
                                                            type="number"
                                                            value={budgetValue}
                                                            onChange={(e) => handleBudgetChange(ward._id, sector, e.target.value)}
                                                            className="w-full px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-sm mono text-[10px] font-bold text-emerald-900 focus:bg-white focus:border-emerald-500 outline-none"
                                                        />
                                                        <p className="text-[8px] mono text-gray-400 text-right uppercase">Set Budget</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-gray-900 mono">₹{(budgetValue / 1000).toFixed(0)}k</p>
                                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (budgetValue / 200000) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Support Panel */}
                    <div className="space-y-6">
                        <div className="bg-indigo-900 rounded-sm p-5 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full flex items-center justify-center">
                                <ShieldAlert size={20} className="text-indigo-400/50" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-400" /> AI Recommendations
                            </h3>
                            <div className="space-y-4">
                                {aiRecommendations?.budgetAdvice?.recommendations?.map((rec, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-sm hover:bg-white/10 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (isEditing) {
                                                const ward = wards.find(w => w.name === rec.ward);
                                                if (ward) handleBudgetChange(ward._id, rec.sector, (editData[ward._id][rec.sector].budget || 0) * 1.25);
                                            }
                                        }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="mono text-[8px] bg-indigo-500 px-1 rounded-sm uppercase">{rec.sector}</span>
                                            <span className="text-[10px] font-bold text-indigo-200">{rec.ward}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-300 leading-relaxed italic">"{rec.recommendation}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-sm p-5">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-900">Allocation Tip</h3>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1" />
                                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase">Higher budgets improve <span className="font-bold text-gray-900">Infrastructure Resilience</span> reducing failure rate.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1" />
                                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase">Slum zones require <span className="font-bold text-gray-900">2x Baseline</span> budget for stable sewage health.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
