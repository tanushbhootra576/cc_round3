import express from 'express';
import { triggerDisaster } from '../services/simulationService.js';
import { getHistoricalReplay } from '../services/predictionService.js';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/sim/disaster
 * @desc    Trigger or clear a city-wide disaster scenario
 */
router.post('/disaster', protect, restrictTo('government'), async (req, res) => {
    try {
        const { type, severity } = req.body;
        const scenario = triggerDisaster(type, severity);
        res.json({ message: `Disaster scenario: ${type} activated`, scenario });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   GET /api/sim/replay
 * @desc    Get historical sensor reading frames for replay
 */
router.get('/replay', protect, async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ message: 'Start and end times required' });

        const frames = await getHistoricalReplay(start, end);
        res.json(frames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
