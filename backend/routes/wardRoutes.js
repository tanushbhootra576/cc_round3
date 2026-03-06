import express from 'express';
import Ward from '../models/Ward.js';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/wards
 * @desc    Get all wards with current sensor data
 */
router.get('/', protect, async (req, res) => {
    try {
        const wards = await Ward.find().sort({ wardId: 1 });
        res.json(wards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   POST /api/wards
 * @desc    Create a new ward
 */
router.post('/', protect, restrictTo('government'), async (req, res) => {
    try {
        const ward = await Ward.create(req.body);
        res.status(201).json(ward);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/wards/:id
 * @desc    Update ward details or budget
 */
router.patch('/:id', protect, restrictTo('government'), async (req, res) => {
    try {
        const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        res.json(ward);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @route   DELETE /api/wards/:id
 * @desc    Remove a ward
 */
router.delete('/:id', protect, restrictTo('government'), async (req, res) => {
    try {
        const ward = await Ward.findByIdAndDelete(req.params.id);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        res.json({ message: 'Ward removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
