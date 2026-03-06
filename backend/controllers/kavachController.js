import Ward from '../models/Ward.js';
import SensorReading from '../models/SensorReading.js';
import { getResourceForecast, getInfrastructureHotspots } from '../services/predictionService.js';
import { generateOperationalAIPlan, recommendBudgetRedistribution } from '../services/aiDecisionService.js';

/**
 * Global Smart City Overview
 */
export const getKavachOverview = async (req, res) => {
    try {
        const wards = await Ward.find().select('name wardId zone currentHealthIndex resources');
        const chi = wards.reduce((acc, w) => acc + w.currentHealthIndex, 0) / (wards.length || 1);

        // Get aggregated resource averages across city
        const resourceAverages = {
            power: 0, water: 0, traffic: 0, sewage: 0, waste: 0, internet: 0
        };

        wards.forEach(w => {
            Object.keys(resourceAverages).forEach(key => {
                resourceAverages[key] += w.resources[key].utilization;
            });
        });

        Object.keys(resourceAverages).forEach(key => {
            resourceAverages[key] = Math.round(resourceAverages[key] / (wards.length || 1));
        });

        const hotspots = await getInfrastructureHotspots();

        res.json({
            cityHealthIndex: Math.round(chi),
            wardCount: wards.length,
            resourceAverages,
            hotspots: hotspots.slice(0, 5),
            timestamp: new Date()
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Detailed analysis for a specific ward
 */
export const getWardAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const ward = await Ward.findById(id);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });

        const forecast = await getResourceForecast(id);
        const historical = await SensorReading.find({ ward: id })
            .sort({ timestamp: -1 })
            .limit(50); // Last 50 readings (~4 mins)

        const aiPlan = await generateOperationalAIPlan(id);

        res.json({
            ward,
            forecast,
            historical: historical.reverse(),
            aiPlan: aiPlan[0] || null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * AI Decision Support Center
 */
export const getAIDecisionSupport = async (req, res) => {
    try {
        const [operationalPlans, budgetAdvice] = await Promise.all([
            generateOperationalAIPlan(),
            recommendBudgetRedistribution()
        ]);

        res.json({
            operationalPlans: operationalPlans.slice(0, 10),
            budgetAdvice,
            timestamp: new Date()
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
