import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Plus, Search, MapPin, Users, Wallet, BarChart2,
    Trash2, Edit2, Shield, X, Check, AlertCircle, Info
} from 'lucide-react';

export default function WardManagement() {
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingWard, setEditingWard] = useState(null);
    const [formData, setFormData] = useState({
        wardId: '',
        name: '',
        zone: 'Residential',
        population: 0,
        coordinates: [77.5946, 12.9716], // Default [lng, lat]
        resources: {
            power: { capacity: 1000, budget: 100000 },
            water: { capacity: 1000, budget: 100000 },
            traffic: { capacity: 1000, budget: 100000 },
            sewage: { capacity: 1000, budget: 100000 },
            waste: { capacity: 1000, budget: 100000 },
            internet: { capacity: 1000, budget: 100000 }
        }
    });

    const fetchWards = async () => {
        try {
            setLoading(true);
            const res = await api.get('/wards');
            setWards(res.data);
        } catch (err) {
            console.error('Error fetching wards:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWards(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: formData.coordinates
                }
            };

            if (editingWard) {
                await api.patch(`/wards/${editingWard._id}`, payload);
            } else {
                await api.post('/wards', payload);
            }

            setShowModal(false);
            setEditingWard(null);
            fetchWards();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving ward');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ward?')) return;
        try {
            await api.delete(`/wards/${id}`);
            fetchWards();
        } catch (err) {
            alert('Error deleting ward');
        }
    };

    const openEdit = (ward) => {
        setEditingWard(ward);
        setFormData({
            wardId: ward.wardId,
            name: ward.name,
            zone: ward.zone,
            population: ward.population,
            coordinates: ward.location?.coordinates || [77.5946, 12.9716],
            resources: ward.resources
        });
        setShowModal(true);
    };

    const filteredWards = wards.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.wardId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mono tracking-tight uppercase">Infrastructure Registry</h1>
                    <p className="text-xs text-gray-500 mono mt-1">Manage ward classifications, capacities, and resource budgets</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH WARD..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-sm mono text-xs focus:ring-1 focus:ring-blue-500 outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingWard(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm mono text-xs font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={14} /> ADD WARD
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-sm border border-gray-200" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWards.map(ward => (
                        <div key={ward._id} className="bg-white border border-gray-200 rounded-sm p-5 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />

                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-bold mono text-gray-500 border border-gray-200 uppercase">{ward.wardId}</span>
                                        <span className="mono text-[10px] text-blue-600 font-bold uppercase">{ward.zone}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ward.name}</h3>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(ward)} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded-sm transition-colors border border-transparent hover:border-gray-200">
                                        <Edit2 size={12} />
                                    </button>
                                    <button onClick={() => handleDelete(ward._id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-sm transition-colors border border-transparent hover:border-gray-200">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <p className="mono text-[9px] text-gray-400 uppercase tracking-widest">Population</p>
                                    <div className="flex items-center gap-1.5">
                                        <Users size={12} className="text-gray-400" />
                                        <span className="text-xs font-bold text-gray-700">{ward.population.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="mono text-[9px] text-gray-400 uppercase tracking-widest">Health Index</p>
                                    <div className="flex items-center gap-1.5">
                                        <BarChart2 size={12} className={ward.currentHealthIndex > 70 ? 'text-green-500' : 'text-amber-500'} />
                                        <span className={`text-xs font-bold ${ward.currentHealthIndex > 70 ? 'text-green-600' : 'text-amber-600'}`}>{Math.round(ward.currentHealthIndex)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 cursor-pointer" onClick={() => openEdit(ward)}>
                                <p className="mono text-[9px] text-gray-400 uppercase tracking-widest mb-2">Resource Caps</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(ward.resources).map(key => (
                                        <div key={key} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-sm">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <span className="mono text-[8px] text-gray-500 uppercase">{key}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl fade-in">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-sm font-black mono tracking-widest uppercase">{editingWard ? 'Edit Infrastructure' : 'Register New Ward'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="mono text-[10px] font-bold text-gray-500 uppercase">Ward Identifier</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., W10"
                                        value={formData.wardId}
                                        onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="mono text-[10px] font-bold text-gray-500 uppercase">Ward Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., Koramangala"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="mono text-[10px] font-bold text-gray-500 uppercase">Zone Classification</label>
                                    <select
                                        value={formData.zone}
                                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Hospital">Hospital</option>
                                        <option value="Educational">Educational</option>
                                        <option value="Slum">Slum Zone (Vulnerable)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="mono text-[10px] font-bold text-gray-500 uppercase">Population Count</label>
                                    <input
                                        type="number"
                                        value={formData.population}
                                        onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="mono text-[10px] font-black text-blue-600 uppercase border-b border-blue-100 pb-2">Resource Configuration & Budgeting</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {Object.keys(formData.resources).map(key => (
                                        <div key={key} className="space-y-3 p-3 bg-gray-50/50 border border-gray-100 rounded-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="mono text-[10px] font-bold text-gray-700 uppercase">{key}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="mono text-[8px] text-gray-400 uppercase">Capacity (Units)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.resources[key].capacity}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            resources: {
                                                                ...formData.resources,
                                                                [key]: { ...formData.resources[key], capacity: parseInt(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full px-2 py-1 border border-gray-200 rounded-sm mono text-[10px] outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="mono text-[8px] text-gray-400 uppercase">Budget Allocation</label>
                                                    <input
                                                        type="number"
                                                        value={formData.resources[key].budget}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            resources: {
                                                                ...formData.resources,
                                                                [key]: { ...formData.resources[key], budget: parseInt(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full px-2 py-1 border border-gray-200 rounded-sm mono text-[10px] outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 border border-gray-200 text-gray-500 mono text-xs font-bold rounded-sm hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-gray-900 text-white mono text-xs font-bold rounded-sm hover:bg-black active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <Check size={14} /> {editingWard ? 'UPDATE WARD' : 'REGISTER WARD'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
