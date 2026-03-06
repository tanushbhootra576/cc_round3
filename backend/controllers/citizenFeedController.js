import CityAlert from '../models/CityAlert.js';
import Announcement from '../models/Announcement.js';

// ════════════════════════════════════════════════════════════
//  CITIZEN FEED — public-facing endpoints (any authenticated user)
// ════════════════════════════════════════════════════════════

// GET /api/feed/alerts — active city alerts sorted by severity
export const getActiveCityAlerts = async (req, res) => {
    try {
        const { category, severity } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;
        if (severity) filter.severity = severity;

        const severityOrder = { critical: 0, warning: 1, info: 2 };
        const alerts = await CityAlert.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('createdBy', 'name')
            .lean();

        // Sort by severity priority, then by recency
        alerts.sort((a, b) => {
            const sA = severityOrder[a.severity] ?? 3;
            const sB = severityOrder[b.severity] ?? 3;
            if (sA !== sB) return sA - sB;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/feed/announcements — active, non-expired announcements
export const getActiveAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } },
            ],
        })
            .sort({ priority: -1, createdAt: -1 })
            .limit(30)
            .populate('createdBy', 'name')
            .lean();

        // Custom priority sort (critical first)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        announcements.sort((a, b) => {
            const pA = priorityOrder[a.priority] ?? 4;
            const pB = priorityOrder[b.priority] ?? 4;
            if (pA !== pB) return pA - pB;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/feed/summary — aggregate counts
export const getCityFeedSummary = async (req, res) => {
    try {
        const [alertsByCategory, alertsBySeverity, totalActiveAlerts, totalAnnouncements] =
            await Promise.all([
                CityAlert.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
                CityAlert.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$severity', count: { $sum: 1 } } },
                ]),
                CityAlert.countDocuments({ isActive: true }),
                Announcement.countDocuments({
                    isActive: true,
                    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
                }),
            ]);

        res.json({
            totalActiveAlerts,
            totalAnnouncements,
            alertsByCategory,
            alertsBySeverity,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
