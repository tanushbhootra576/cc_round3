import SensorReading from '../models/SensorReading.js';
import Ward from '../models/Ward.js';

/**
 * Predicts resource utilization for the next 24 hours based on recent 12h trend
 */
export const getResourceForecast = async (wardId) => {
    const readings = await SensorReading.find({ ward: wardId })
        .sort({ timestamp: -1 })
        .limit(24); // Last 2 hours (assuming 5s intervals = 12 readings/min, actually maybe limit to last 30 mins)

    if (readings.length < 5) return null;

    const resourceKeys = ['power', 'water', 'traffic', 'sewage', 'waste', 'internet'];
    const forecast = {};

    resourceKeys.forEach(key => {
        const values = readings.map(r => r.readings[key].utilization).reverse();
        // Simple linear regression slope for the last few points
        const n = values.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumX2 += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        forecast[key] = {
            current: values[n - 1],
            trend: slope > 0.5 ? 'rising' : (slope < -0.5 ? 'falling' : 'stable'),
            predicted24h: Math.max(0, Math.min(100, values[n - 1] + (slope * 12))), // Rough guestimate
            slope
        };
    });

    return forecast;
};

/**
 * Identifies infrastructure hotspots (high utilization across wards)
 */
export const getInfrastructureHotspots = async () => {
    const wards = await Ward.find();
    return wards
        .map(w => ({
            id: w._id,
            name: w.name,
            health: w.currentHealthIndex,
            overloadedSectors: Object.keys(w.resources).filter(k => w.resources[k].utilization > 85)
        }))
        .filter(w => w.overloadedSectors.length > 0 || w.health < 60)
        .sort((a, b) => a.health - b.health);
};

/**
 * Retrieves historical frames for replay
 */
export const getHistoricalReplay = async (startTime, endTime) => {
    return await SensorReading.find({
        timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) }
    })
        .sort({ timestamp: 1 })
        .populate('ward', 'name wardId');
};
