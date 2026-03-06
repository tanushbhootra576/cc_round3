import express from 'express';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';
import {
    createAnnouncement,
    getAllAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    createCityAlert,
    getAllCityAlerts,
    updateCityAlert,
    deleteCityAlert,
    resolveCityAlert,
} from '../controllers/govCrudController.js';

const router = express.Router();
const govOnly = restrictTo('government');

// ── Announcements ─────────────────────────────────────────
router.post('/announcements', protect, govOnly, createAnnouncement);
router.get('/announcements', protect, govOnly, getAllAnnouncements);
router.put('/announcements/:id', protect, govOnly, updateAnnouncement);
router.delete('/announcements/:id', protect, govOnly, deleteAnnouncement);

// ── City Alerts ───────────────────────────────────────────
router.post('/alerts', protect, govOnly, createCityAlert);
router.get('/alerts', protect, govOnly, getAllCityAlerts);
router.put('/alerts/:id', protect, govOnly, updateCityAlert);
router.delete('/alerts/:id', protect, govOnly, deleteCityAlert);
router.patch('/alerts/:id/resolve', protect, govOnly, resolveCityAlert);

export default router;
