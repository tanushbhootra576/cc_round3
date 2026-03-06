import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import {
    Car, AlertTriangle, MapPin, Clock, ArrowRight,
    Flame, RefreshCw, Layers, ShieldAlert
} from 'lucide-react';

export default function CongestionAlerts() {
    const { socket } = useSocket();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zones, setZones] = useState([]);

    const fetchCongestion = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/analytics/congestion');
            setAlerts(res.data.trafficAlerts || []);
            setZones(res.data.zoneSummary || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCongestion();
    }, [fetchCongestion]);

    // Handle real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleAlert = (alert) => {
            if (alert.category === 'traffic') {
                setAlerts(prev => [alert, ...prev].slice(0, 20));
            }
        };

        socket.on('city_alert_new', handleAlert);
        return () => socket.off('city_alert_new', handleAlert);
    }, [socket]);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Car size={16} className="text-orange-600" />
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">Active Traffic Alerts</span>
                </div>
                <button onClick={fetchCongestion} className="p-1 hover:bg-gray-100 rounded-sm transition-colors text-gray-400">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/30">
                {loading && alerts.length === 0 ? (
                    <div className="p-6 space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-16 rounded-sm" />
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center mb-3">
                            <CheckCircle2 size={24} className="text-gray-300" />
                        </div>
                        <p className="mono text-[10px] text-gray-400 tracking-widest uppercase">No Congestion Alerts</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {alerts.map((alert) => (
                            <div key={alert._id} className="p-4 bg-white hover:bg-blue-50/30 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                        }`}>
                                        {alert.severity === 'critical' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-[13px] font-bold text-gray-900 truncate pr-2">{alert.title}</h4>
                                            <span className="mono text-[9px] text-gray-400 whitespace-nowrap">
                                                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-1 mb-2">{alert.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500">
                                                <MapPin size={10} /> {alert.zone || 'General'}
                                            </span>
                                            <span className={`mono text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${alert.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-400 text-white'
                                                }`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <p className="mono text-[9px] text-gray-400 tracking-widest uppercase mb-3">Top Vulnerable Zones</p>
                <div className="flex flex-wrap gap-2">
                    {zones.slice(0, 4).map(z => (
                        <div key={z._id} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-sm flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-700">{z._id}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${z.criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CheckCircle2({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}
