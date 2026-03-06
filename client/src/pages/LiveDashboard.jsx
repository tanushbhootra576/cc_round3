import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import {
    Activity, Zap, Droplets, Car, ShieldAlert, Wifi,
    Trash2, Globe, AlertTriangle, TrendingUp, Info,
    Play, Square, ChevronRight, ChevronLeft, Map as MapIcon,
    Flame, Wind, CloudRain, Zap as PowerIcon
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import 'leaflet/dist/leaflet.css';

// Reusable Stat Component
const ResourceStat = ({ icon: Icon, label, value, color, detail }) => (
    <div className="bg-white border border-gray-200 p-3 rounded-sm flex items-center gap-3">
        <div className={`p-2 rounded-sm ${color.bg} ${color.text}`}>
            <Icon size={16} />
        </div>
        <div className="min-w-0">
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-gray-900 mono leading-none">{Math.round(value)}%</span>
                <span className="mono text-[8px] text-gray-400 uppercase tracking-tighter">{label}</span>
            </div>
            <div className="h-1 w-24 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div className={`h-full ${color.bar} transition-all duration-1000`} style={{ width: `${value}%` }} />
            </div>
        </div>
    </div>
);

export default function LiveDashboard() {
    const { socket } = useSocket();
    const [wards, setWards] = useState([]);
    const [cityHealth, setCityHealth] = useState({ score: 100, timestamp: new Date(), activeDisaster: null });
    const [historicalData, setHistoricalData] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [loading, setLoading] = useState(true);

    // Replay state
    const [isReplaying, setIsReplaying] = useState(false);
    const [replayFrames, setReplayFrames] = useState([]);
    const [replayIndex, setReplayIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/wards');
                setWards(res.data);
                if (res.data.length > 0) setSelectedWard(res.data[0]);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        if (socket) {
            socket.on('ward_updates', (updatedWards) => {
                if (!isReplaying) {
                    setWards(updatedWards);
                    if (selectedWard) {
                        const current = updatedWards.find(w => w._id === selectedWard._id);
                        if (current) setSelectedWard(current);
                    }
                    // Add to local sparkline graph
                    const newPoint = {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        avgHealth: updatedWards.reduce((acc, w) => acc + w.currentHealthIndex, 0) / updatedWards.length
                    };
                    setHistoricalData(prev => [...prev.slice(-20), newPoint]);
                }
            });

            socket.on('city_health_update', (data) => {
                if (!isReplaying) setCityHealth(data);
            });
        }

        return () => {
            if (socket) {
                socket.off('ward_updates');
                socket.off('city_health_update');
            }
        };
    }, [socket, selectedWard, isReplaying]);

    const triggerSimulationDisaster = async (type) => {
        try {
            await api.post('/api/sim/disaster', { type, severity: 'High' });
        } catch (err) {
            alert('Simulation control failed');
        }
    };

    const startReplay = async () => {
        try {
            setIsReplaying(true);
            const end = new Date();
            const start = new Date(end.getTime() - 15 * 60000); // Last 15 mins
            const res = await api.get(`/api/sim/replay?start=${start.toISOString()}&end=${end.toISOString()}`);

            // Group readings by timestamp to simulate "frames"
            const grouped = res.data.reduce((acc, r) => {
                const time = new Date(r.timestamp).getTime();
                if (!acc[time]) acc[time] = [];
                acc[time].push(r);
                return acc;
            }, {});

            setReplayFrames(Object.values(grouped));
            setReplayIndex(0);
        } catch (err) {
            alert('Replay failed to load');
            setIsReplaying(false);
        }
    };

    useEffect(() => {
        let timer;
        if (isReplaying && replayIndex < replayFrames.length) {
            timer = setTimeout(() => {
                // Here we would update the ghost-UI with replay data
                setReplayIndex(prev => prev + 1);
            }, 500);
        } else if (replayIndex >= replayFrames.length) {
            setIsReplaying(false);
        }
        return () => clearTimeout(timer);
    }, [isReplaying, replayIndex, replayFrames]);

    const getHealthColor = (score) => {
        if (score > 80) return { dot: '#10b981', bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500', label: 'OPTIMAL' };
        if (score > 60) return { dot: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', label: 'WARNING' };
        if (score > 40) return { dot: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500', label: 'CRITICAL' };
        return { dot: '#7f1d1d', bg: 'bg-red-100', text: 'text-red-900', bar: 'bg-red-800', label: 'OVERLOAD' };
    };

    if (loading) return <div className="p-8 mono text-xs animate-pulse">BOOTING KAVACH ENGINE...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">

            {/* City Status Bar */}
            <div className="bg-black text-white px-6 py-3 flex items-center justify-between z-20 shadow-xl border-b border-gray-800">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center animate-pulse">
                            <ShieldAlert size={18} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black mono tracking-tighter uppercase">Kavach-City AI <span className="text-blue-500">v2.1</span></h1>
                            <p className="text-[10px] mono text-gray-400">ACTIVE INFRASTRUCTURE TWIN</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-800" />

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-[8px] mono text-gray-500 uppercase">City Health Index</p>
                            <p className={`text-xl font-black mono ${getHealthColor(cityHealth.score).text}`}>{cityHealth.score}%</p>
                        </div>
                        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${getHealthColor(cityHealth.score).bar} transition-all duration-1000`} style={{ width: `${cityHealth.score}%` }} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold mono border ${getHealthColor(cityHealth.score).text} ${getHealthColor(cityHealth.score).bg} border-current`}>
                            {getHealthColor(cityHealth.score).label}
                        </span>
                    </div>

                    {cityHealth.activeDisaster && (
                        <div className="bg-red-600/20 border border-red-500/50 px-3 py-1 rounded-sm flex items-center gap-2 animate-bounce">
                            <AlertTriangle size={14} className="text-red-500" />
                            <span className="mono text-[10px] font-black text-red-500 uppercase">DISASTER ACTIVE: {cityHealth.activeDisaster.type}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[8px] mono text-gray-500 uppercase">Command Uptime</p>
                        <p className="text-xs font-bold mono">00:45:12</p>
                    </div>
                    <button
                        onClick={() => triggerSimulationDisaster('None')}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-sm mono text-[9px] font-bold transition-all border border-gray-700"
                    >
                        RESET SIM
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Controls */}
                <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 overflow-y-auto">
                    {/* Disaster Simulation */}
                    <div className="p-4 border-b border-gray-100">
                        <p className="mono text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Disaster Simulation</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => triggerSimulationDisaster('Power Outage')} className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-sm hover:border-red-500 group transition-all">
                                <PowerIcon size={14} className="text-gray-400 group-hover:text-red-500" />
                                <span className="mono text-[10px] font-bold text-gray-600 uppercase">Power Outage</span>
                            </button>
                            <button onClick={() => triggerSimulationDisaster('Flood')} className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-sm hover:border-blue-500 group transition-all">
                                <CloudRain size={14} className="text-gray-400 group-hover:text-blue-500" />
                                <span className="mono text-[10px] font-bold text-gray-600 uppercase">Flooding</span>
                            </button>
                            <button onClick={() => triggerSimulationDisaster('Traffic Jam')} className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-sm hover:border-amber-500 group transition-all">
                                <Car size={14} className="text-gray-400 group-hover:text-amber-500" />
                                <span className="mono text-[10px] font-bold text-gray-600 uppercase">Traffic Jam</span>
                            </button>
                            <button onClick={() => triggerSimulationDisaster('None')} className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-sm hover:border-green-500 group transition-all">
                                <Play size={14} className="text-gray-400 group-hover:text-green-500" />
                                <span className="mono text-[10px] font-bold text-gray-600 uppercase">Normal Ops</span>
                            </button>
                        </div>
                    </div>

                    {/* Historical Replay */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="mono text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Historical Replay</p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-sm">
                                <span className="mono text-[10px] text-gray-500 uppercase">Playback</span>
                                <div className="flex gap-2">
                                    {!isReplaying ? (
                                        <button onClick={startReplay} className="p-1 px-2 bg-blue-600 text-white rounded-sm mono text-[9px] font-black uppercase">START</button>
                                    ) : (
                                        <button onClick={() => setIsReplaying(false)} className="p-1 px-2 bg-red-600 text-white rounded-sm mono text-[9px] font-black uppercase flex items-center gap-1"><Square size={10} /> STOP</button>
                                    )}
                                </div>
                            </div>
                            {isReplaying && (
                                <div className="space-y-2">
                                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(replayIndex / replayFrames.length) * 100}%` }} />
                                    </div>
                                    <p className="mono text-[9px] text-center text-blue-600 font-bold uppercase animate-pulse">Streaming Frame {replayIndex} / {replayFrames.length}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ward Selection List */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 bg-white sticky top-0 border-b border-gray-100 z-10">
                            <p className="mono text-[10px] font-black text-gray-400 uppercase tracking-widest">Wards Infrastructure (10)</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {wards.map(ward => (
                                <div
                                    key={ward._id}
                                    onClick={() => setSelectedWard(ward)}
                                    className={`p-4 cursor-pointer transition-all border-l-4 ${selectedWard?._id === ward._id ? 'bg-blue-50/50 border-blue-600' : 'hover:bg-gray-50 border-transparent'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-gray-900 mono uppercase tracking-tighter">{ward.name}</span>
                                        <span className={`text-[10px] font-black mono ${getHealthColor(ward.currentHealthIndex).text}`}>
                                            {Math.round(ward.currentHealthIndex)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${getHealthColor(ward.currentHealthIndex).bar}`} style={{ width: `${ward.currentHealthIndex}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Viewport */}
                <main className="flex-1 flex flex-col relative">

                    {/* Top Panel - Selected Ward Details */}
                    {selectedWard && (
                        <div className="bg-white border-b border-gray-200 p-6 z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center">
                                        <MapIcon size={24} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black mono uppercase rounded-sm">{selectedWard.wardId}</span>
                                            <span className="mono text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedWard.zone} Zone</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{selectedWard.name}</h2>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="text-right">
                                        <p className="mono text-[10px] text-gray-400 uppercase">Population</p>
                                        <p className="text-lg font-black mono text-gray-900">{selectedWard.population.toLocaleString()}</p>
                                    </div>
                                    <div className="h-10 w-px bg-gray-200" />
                                    <div className="text-right">
                                        <p className="mono text-[10px] text-gray-400 uppercase">Ward Status</p>
                                        <p className={`text-lg font-black mono ${getHealthColor(selectedWard.currentHealthIndex).text}`}>{getHealthColor(selectedWard.currentHealthIndex).label}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <ResourceStat icon={PowerIcon} label="POWER" value={selectedWard.resources.power.utilization} color={{ bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-400' }} />
                                <ResourceStat icon={Droplets} label="WATER" value={selectedWard.resources.water.utilization} color={{ bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-400' }} />
                                <ResourceStat icon={Car} label="TRAFFIC" value={selectedWard.resources.traffic.utilization} color={{ bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-400' }} />
                                <ResourceStat icon={Activity} label="SEWAGE" value={selectedWard.resources.sewage.utilization} color={{ bg: 'bg-indigo-50', text: 'text-indigo-600', bar: 'bg-indigo-400' }} />
                                <ResourceStat icon={Trash2} label="WASTE" value={selectedWard.resources.waste.utilization} color={{ bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-400' }} />
                                <ResourceStat icon={Wifi} label="INTERNET" value={selectedWard.resources.internet.utilization} color={{ bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-400' }} />
                            </div>
                        </div>
                    )}

                    {/* Map & Visualization */}
                    <div className="flex-1 relative flex flex-col bg-gray-200">
                        {/* Real-time Map overlay */}
                        <div className="absolute inset-0 z-0">
                            <MapContainer
                                center={[12.9716, 77.5946]}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; CARTO'
                                />
                                {wards.map((ward) => (
                                    <CircleMarker
                                        key={ward._id}
                                        center={ward.location.coordinates.slice().reverse()}
                                        radius={12 + (100 - ward.currentHealthIndex) / 10}
                                        pathOptions={{
                                            fillColor: getHealthColor(ward.currentHealthIndex).dot,
                                            color: 'white',
                                            weight: 2,
                                            fillOpacity: 0.8
                                        }}
                                        eventHandlers={{
                                            click: () => setSelectedWard(ward)
                                        }}
                                    >
                                        <Popup>
                                            <div className="mono p-1">
                                                <p className="font-bold border-b mb-1 uppercase">{ward.name}</p>
                                                <p className="text-[10px]">HEALTH: {Math.round(ward.currentHealthIndex)}%</p>
                                                <p className="text-[10px]">TRAFFIC: {Math.round(ward.resources.traffic.utilization)}%</p>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* Bottom Panel - Trend Analysis */}
                        <div className="absolute bottom-6 left-6 right-6 h-48 bg-white/90 backdrop-blur-md border border-white/50 rounded-sm shadow-2xl overflow-hidden p-4 flex gap-6 z-10 transition-all hover:h-64 group">
                            <div className="w-1/3 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={14} className="text-blue-600" />
                                    <span className="mono text-[10px] font-black text-gray-900 uppercase">Trend Analysis</span>
                                </div>
                                <div className="flex-1 bg-gray-50/50 rounded-sm p-3 relative overflow-hidden">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historicalData}>
                                            <defs>
                                                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="avgHealth" stroke="#2563eb" fillOpacity={1} fill="url(#colorHealth)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black text-white text-[8px] mono rounded-sm">CITY AVG HEALTH</div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={14} className="text-amber-500" />
                                    <span className="mono text-[10px] font-black text-gray-900 uppercase">Sector Predicted Demand</span>
                                </div>
                                <div className="grid grid-cols-2 h-full gap-4">
                                    {['power', 'traffic'].map(res => (
                                        <div key={res} className="bg-gray-50/50 p-3 rounded-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="mono text-[9px] text-gray-500 uppercase">{res} Forecast</span>
                                                <span className="mono text-[9px] font-bold text-gray-900">NEXT 4H</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-black mono text-gray-900 tracking-tighter">
                                                    {Math.round((selectedWard?.resources[res].utilization || 0) + (Math.random() * 10 - 5))}%
                                                </div>
                                                {Math.random() > 0.5 ? <ChevronRight size={14} className="-rotate-45 text-red-500" /> : <ChevronRight size={14} className="rotate-45 text-green-500" />}
                                            </div>
                                            <p className="text-[8px] mono text-gray-400 uppercase mt-1">Simulated predictive vector based on moving average</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
