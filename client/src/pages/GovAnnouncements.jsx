import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Megaphone, Plus, Pencil, Trash2, X, Eye, EyeOff,
    ChevronLeft, ChevronRight, RefreshCw, ArrowLeft,
} from 'lucide-react';

const CATEGORIES = ['general', 'maintenance', 'emergency', 'event'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const PRIORITY_BADGE = {
    low: 'bg-gray-50 text-gray-600 border-gray-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
};

const CAT_DOT = {
    general: 'bg-gray-400', maintenance: 'bg-amber-400',
    emergency: 'bg-red-500', event: 'bg-blue-500',
};

export default function GovAnnouncements() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ title: '', body: '', category: 'general', priority: 'medium', isActive: true, expiresAt: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/gov/announcements?page=${page}&limit=15`);
            setItems(res.data.announcements || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const resetForm = () => {
        setForm({ title: '', body: '', category: 'general', priority: 'medium', isActive: true, expiresAt: '' });
        setEditId(null);
        setShowForm(false);
    };

    const openEdit = (item) => {
        setForm({
            title: item.title,
            body: item.body,
            category: item.category,
            priority: item.priority,
            isActive: item.isActive,
            expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : '',
        });
        setEditId(item._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, expiresAt: form.expiresAt || null };
            if (editId) {
                await api.put(`/gov/announcements/${editId}`, payload);
            } else {
                await api.post('/gov/announcements', payload);
            }
            resetForm();
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (item) => {
        try {
            await api.put(`/gov/announcements/${item._id}`, { isActive: !item.isActive });
            fetchItems();
        } catch { /* ignore */ }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/gov/announcements/${id}`);
            setDeleteConfirm(null);
            fetchItems();
        } catch { /* ignore */ }
    };

    const activeCount = items.filter(a => a.isActive).length;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/gov-dashboard')} className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
                            <ArrowLeft size={16} className="text-gray-500" />
                        </button>
                        <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center">
                            <Megaphone size={14} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Announcements Management</h1>
                            <p className="mono text-[10px] text-gray-400 tracking-widest">GOVERNMENT PORTAL · CRUD OPERATIONS</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchItems} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-sm mono text-[10px] text-gray-500 hover:bg-gray-50 transition-colors">
                            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> REFRESH
                        </button>
                        <button onClick={() => { resetForm(); setShowForm(true); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={14} /> New Announcement
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 rounded-sm p-4 border-l-4 border-l-gray-400">
                        <p className="mono text-2xl font-bold text-gray-900">{total}</p>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mt-1">TOTAL</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-sm p-4 border-l-4 border-l-blue-500">
                        <p className="mono text-2xl font-bold text-blue-600">{activeCount}</p>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mt-1">PUBLISHED</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-sm p-4 border-l-4 border-l-gray-300">
                        <p className="mono text-2xl font-bold text-gray-400">{total - activeCount}</p>
                        <p className="mono text-[10px] text-gray-400 tracking-widest mt-1">HIDDEN</p>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={resetForm}>
                        <div className="bg-white border border-gray-200 rounded-sm shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">{editId ? 'Edit Announcement' : 'Create Announcement'}</span>
                                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-sm"><X size={16} className="text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">TITLE</label>
                                    <input type="text" required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm" placeholder="Announcement title" />
                                </div>
                                <div>
                                    <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">BODY</label>
                                    <textarea required value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm h-24 resize-none" placeholder="Announcement content..." />
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
                                        <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">PRIORITY</label>
                                        <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm">
                                            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mono text-[10px] text-gray-500 tracking-widest mb-1.5">EXPIRES AT (optional)</label>
                                    <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isActive" checked={form.isActive}
                                        onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300" />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">Publish immediately</label>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <button type="submit" disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                                        {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
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
                            <p className="text-sm font-semibold text-gray-900 mb-1">Delete this announcement?</p>
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

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    {['#', 'Title', 'Category', 'Priority', 'Status', 'Expires', 'Created', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left mono text-[9px] text-gray-400 tracking-widest font-semibold uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && items.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-16 text-center"><div className="skeleton h-4 w-48 mx-auto rounded" /></td></tr>
                                ) : items.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-16 text-center mono text-[11px] text-gray-400">NO ANNOUNCEMENTS YET</td></tr>
                                ) : items.map((item, i) => (
                                    <tr key={item._id} className={`transition-colors hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className="px-4 py-3 mono text-[10px] text-gray-400">{String((page - 1) * 15 + i + 1).padStart(2, '0')}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-medium text-gray-800 line-clamp-1 max-w-[220px]">{item.title}</p>
                                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{item.body}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-600">
                                                <span className={`w-2 h-2 rounded-full ${CAT_DOT[item.category] || 'bg-gray-400'}`} />
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border mono text-[9px] font-semibold tracking-wider uppercase ${PRIORITY_BADGE[item.priority]}`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleActive(item)} title={item.isActive ? 'Unpublish' : 'Publish'}
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border mono text-[9px] font-semibold tracking-wider cursor-pointer transition-colors ${item.isActive
                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                                                    }`}>
                                                {item.isActive ? <><Eye size={9} /> LIVE</> : <><EyeOff size={9} /> HIDDEN</>}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 mono text-[10px] text-gray-400">
                                            {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className="px-4 py-3 mono text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(item)} title="Edit"
                                                    className="p-1.5 rounded-sm hover:bg-blue-50 text-blue-600 transition-colors">
                                                    <Pencil size={13} />
                                                </button>
                                                <button onClick={() => setDeleteConfirm(item._id)} title="Delete"
                                                    className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

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
