import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    AlertTriangle, Plus, Pencil, Trash2, CheckCircle2, X,
    ChevronLeft, ChevronRight, Filter, Shield, RefreshCw,
    Zap, Droplets, Car, Construction, Wind, CloudRain, MoreHorizontal,
    ArrowLeft,
} from 'lucide-react';

const CATEGORIES = ['traffic', 'water', 'power', 'drainage', 'construction', 'pollution', 'other'];
const SEVERITIES = ['info', 'warning', 'critical'];

const CAT_ICON = {
    traffic: Car, water: Droplets, power: Zap, drainage: CloudRain,
    construction: Construction, pollution: Wind, other: MoreHorizontal,
};
const CAT_COLOR = {
    traffic: 'text-orange-600 bg-orange-50 border-orange-200',
    water: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    power: 'text-amber-600 bg-amber-50 border-amber-200',
    drainage: 'text-blue-600 bg-blue-50 border-blue-200',
    construction: 'text-gray-600 bg-gray-50 border-gray-200',
    pollution: 'text-purple-600 bg-purple-50 border-purple-200',
    other: 'text-gray-500 bg-gray-50 border-gray-200',
};
const SEV_BADGE = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
};

export default function GovManageAlerts() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', category: 'traffic', severity: 'info', zone: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (statusFilter) params.set('status', statusFilter);
            const res = await api.get(`/gov/alerts?${params}`);
            setAlerts(res.data.alerts || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
    useEffect(() => { setPage(1); }, [statusFilter]);

    const resetForm = () => {
        setForm({ title: '', description: '', category: 'traffic', severity: 'info', zone: '' });
        setEditId(null);
        setShowForm(false);
    };

    const openEditForm = (alert) => {
        setForm({
            title: alert.title,
            description: alert.description,
            category: alert.category,
            severity: alert.severity,
            zone: alert.zone || '',
        });
        setEditId(alert._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/gov/alerts/${editId}`, form);
            } else {
                await api.post('/gov/alerts', form);
            }
            resetForm();
            fetchAlerts();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save alert');
        } finally {
            setSaving(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await api.patch(`/gov/alerts/${id}/resolve`);
            fetchAlerts();
        } catch { /* ignore */ }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/gov/alerts/${id}`);
            setDeleteConfirm(null);
            fetchAlerts();
        } catch { /* ignore */ }
    };

    const activeCount = alerts.filter(a => a.isActive).length;
    const resolvedCount = alerts.filter(a => !a.isActive).length;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/gov-dashboard')} className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
                            <ArrowLeft size={16} className="text-gray-500" />
                        </button>
                        <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center">
                            <AlertTriangle size={14} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">City Alerts Management</h1>
                            <p className="mono text-[10px] text-gray-400 tracking-widest">GOVERNMENT PORTAL · CRUD OPERATIONS</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchAlerts} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-sm mono text-[10px] text-gray-500 hover:bg-gray-50 transition-colors">
                            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> REFRESH
                        </button>
                        <button onClick={() => { resetForm(); setShowForm(true); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={14} /> New Alert
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 rounded-sm p-4 border-l-4 border-l-gray-400">
                        <p className="mono text-2xl font-bold text-gray-900">{total}</p>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mt-1">TOTAL ALERTS</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-sm p-4 border-l-4 border-l-red-500">
                        <p className="mono text-2xl font-bold text-red-600">{activeCount}</p>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mt-1">ACTIVE</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-sm p-4 border-l-4 border-l-green-600">
                        <p className="mono text-2xl font-bold text-green-600">{resolvedCount}</p>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mt-1">RESOLVED</p>
                    </div>
                </div>

                {/* Create/Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => resetForm()}>
                        <div className="bg-white border border-gray-200 rounded-sm shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">{editId ? 'Edit Alert' : 'Create New Alert'}</span>
                                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-sm"><X size={16} className="text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">TITLE</label>
                                    <input type="text" required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm" placeholder="e.g. Heavy traffic on MG Road" />
                                </div>
                                <div>
                                    <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">DESCRIPTION</label>
                                    <textarea required value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm h-20 resize-none" placeholder="Describe the situation..." />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">CATEGORY</label>
                                        <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm">
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">SEVERITY</label>
                                        <select value={form.severity} onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm">
                                            {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">ZONE / AREA</label>
                                    <input type="text" value={form.zone} onChange={(e) => setForm(f => ({ ...f, zone: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm" placeholder="e.g. BTM Layout, Ward 5" />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <button type="submit" disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                                        {saving ? 'Saving...' : editId ? 'Update Alert' : 'Create Alert'}
                                    </button>
                                    <button type="button" onClick={resetForm}
                                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white border border-gray-200 rounded-sm shadow-xl p-6 max-w-sm mx-4 text-center">
                            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-900 mb-1">Delete this alert?</p>
                            <p className="text-xs text-gray-500 mb-4">This action cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-sm text-sm font-medium hover:bg-red-700 transition-colors">
                                    Delete
                                </button>
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="flex items-center gap-3">
                    <Filter size={14} className="text-gray-400" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-sm mono text-[11px] text-gray-600 tracking-wide">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                {/* Alerts Table */}
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    {['#', 'Title', 'Category', 'Severity', 'Zone', 'Status', 'Created', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left mono text-[9px] text-gray-400 tracking-widest font-semibold uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && alerts.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-16 text-center"><div className="skeleton h-4 w-48 mx-auto rounded" /></td></tr>
                                ) : alerts.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-16 text-center mono text-[11px] text-gray-400">NO ALERTS FOUND</td></tr>
                                ) : alerts.map((alert, i) => {
                                    const CatIcon = CAT_ICON[alert.category] || MoreHorizontal;
                                    return (
                                        <tr key={alert._id} className={`transition-colors hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="px-4 py-3 mono text-[10px] text-gray-400">{String((page - 1) * 15 + i + 1).padStart(2, '0')}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-medium text-gray-800 line-clamp-1 max-w-[220px]">{alert.title}</p>
                                                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{alert.description}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] font-medium ${CAT_COLOR[alert.category]}`}>
                                                    <CatIcon size={10} /> {alert.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border mono text-[9px] font-semibold tracking-wider uppercase ${SEV_BADGE[alert.severity]}`}>
                                                    {alert.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{alert.zone || '—'}</td>
                                            <td className="px-4 py-3">
                                                {alert.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-sm mono text-[9px] text-red-700 font-semibold tracking-wider">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-sm mono text-[9px] text-green-700 font-semibold tracking-wider">
                                                        <CheckCircle2 size={9} /> RESOLVED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 mono text-[10px] text-gray-400">{new Date(alert.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {alert.isActive && (
                                                        <button onClick={() => handleResolve(alert._id)} title="Resolve"
                                                            className="p-1.5 rounded-sm hover:bg-green-50 text-green-600 transition-colors">
                                                            <CheckCircle2 size={13} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => openEditForm(alert)} title="Edit"
                                                        className="p-1.5 rounded-sm hover:bg-blue-50 text-blue-600 transition-colors">
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(alert._id)} title="Delete"
                                                        className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                            <span className="mono text-[10px] text-gray-400">Page {page} of {pages} · {total} records</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-1.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
                                    <ChevronLeft size={13} className="text-gray-500" />
                                </button>
                                {[...Array(Math.min(pages, 7))].map((_, i) => (
                                    <button key={i + 1} onClick={() => setPage(i + 1)}
                                        className={`mono w-7 h-7 rounded-sm text-[11px] font-medium transition-colors border ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                                    className="p-1.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
                                    <ChevronRight size={13} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
