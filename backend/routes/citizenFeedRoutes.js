import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
    getActiveCityAlerts,
    getActiveAnnouncements,
    getCityFeedSummary,
} from '../controllers/citizenFeedController.js';

const router = express.Router();

// Any authenticated user can access the feed
router.get('/alerts', protect, getActiveCityAlerts);
router.get('/announcements', protect, getActiveAnnouncements);
router.get('/summary', protect, getCityFeedSummary);

export default router;
