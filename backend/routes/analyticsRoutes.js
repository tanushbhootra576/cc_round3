import express from 'express';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';
import {
    getAnalyticsOverview,
    getBudgetAnalysis,
    getCongestionAlerts,
} from '../controllers/analyticsController.js';
import {
    getKavachOverview,
    getWardAnalytics,
    getAIDecisionSupport
} from '../controllers/kavachController.js';

const router = express.Router();
const govOnly = restrictTo('government');

router.get('/overview', protect, govOnly, getAnalyticsOverview);
router.get('/budget', protect, govOnly, getBudgetAnalysis);
router.get('/congestion', protect, govOnly, getCongestionAlerts);

// Kavach-City AI specific
router.get('/kavach-overview', protect, getKavachOverview);
router.get('/ward-details/:id', protect, getWardAnalytics);
router.get('/ai-recommendations', protect, govOnly, getAIDecisionSupport);

export default router;
