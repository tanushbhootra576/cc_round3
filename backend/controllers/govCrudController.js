import Announcement from '../models/Announcement.js';
import CityAlert from '../models/CityAlert.js';

// ════════════════════════════════════════════════════════════
//  ANNOUNCEMENTS CRUD (Government only)
// ════════════════════════════════════════════════════════════

// POST /api/gov/announcements
export const createAnnouncement = async (req, res) => {
    try {
        const { title, body, category, priority, isActive, expiresAt } = req.body;
        const announcement = await Announcement.create({
            title,
            body,
            category,
            priority,
            isActive: isActive !== undefined ? isActive : true,
            expiresAt: expiresAt || null,
            createdBy: req.user.id,
        });
        req.io?.emit('announcement_new', announcement);
        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/gov/announcements
export const getAllAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('createdBy', 'name email');
        const total = await Announcement.countDocuments();
        res.json({ announcements, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/gov/announcements/:id
export const updateAnnouncement = async (req, res) => {
    try {
        const { title, body, category, priority, isActive, expiresAt } = req.body;
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

        if (title !== undefined) announcement.title = title;
        if (body !== undefined) announcement.body = body;
        if (category !== undefined) announcement.category = category;
        if (priority !== undefined) announcement.priority = priority;
        if (isActive !== undefined) announcement.isActive = isActive;
        if (expiresAt !== undefined) announcement.expiresAt = expiresAt;

        await announcement.save();
        req.io?.emit('announcement_updated', announcement);
        res.json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/gov/announcements/:id
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ════════════════════════════════════════════════════════════
//  CITY ALERTS CRUD (Government only)
// ════════════════════════════════════════════════════════════

// POST /api/gov/alerts
export const createCityAlert = async (req, res) => {
    try {
        const { title, description, category, severity, zone, location } = req.body;
        const alertData = {
            title,
            description,
            category,
            severity: severity || 'info',
            zone: zone || '',
            createdBy: req.user.id,
        };

        if (location && location.coordinates) {
            alertData.location = {
                type: 'Point',
                coordinates: location.coordinates,
            };
        }

        const alert = await CityAlert.create(alertData);
        req.io?.emit('city_alert_new', alert);
        res.status(201).json(alert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/gov/alerts
export const getAllCityAlerts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status === 'active') filter.isActive = true;
        if (status === 'resolved') filter.isActive = false;

        const alerts = await CityAlert.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('createdBy', 'name email');
        const total = await CityAlert.countDocuments(filter);
        res.json({ alerts, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/gov/alerts/:id
export const updateCityAlert = async (req, res) => {
    try {
        const { title, description, category, severity, zone, location } = req.body;
        const alert = await CityAlert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'City alert not found' });

        if (title !== undefined) alert.title = title;
        if (description !== undefined) alert.description = description;
        if (category !== undefined) alert.category = category;
        if (severity !== undefined) alert.severity = severity;
        if (zone !== undefined) alert.zone = zone;
        if (location && location.coordinates) {
            alert.location = { type: 'Point', coordinates: location.coordinates };
        }

        await alert.save();
        req.io?.emit('city_alert_updated', alert);
        res.json(alert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/gov/alerts/:id
export const deleteCityAlert = async (req, res) => {
    try {
        const alert = await CityAlert.findByIdAndDelete(req.params.id);
        if (!alert) return res.status(404).json({ message: 'City alert not found' });
        req.io?.emit('city_alert_resolved', { _id: alert._id });
        res.json({ message: 'City alert deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/gov/alerts/:id/resolve
export const resolveCityAlert = async (req, res) => {
    try {
        const alert = await CityAlert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'City alert not found' });

        alert.isActive = false;
        alert.resolvedAt = new Date();
        await alert.save();

        req.io?.emit('city_alert_resolved', alert);
        res.json(alert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
