import Ward from '../models/Ward.js';
import SensorReading from '../models/SensorReading.js';

let ioInstance = null;
let simulationInterval = null;
let currentDisaster = null; // { type, severity, affectedWards: [] }

const RESOURCE_KEYS = ['power', 'water', 'traffic', 'sewage', 'waste', 'internet'];

// Weights for CHI calculation
const WEIGHTS = {
    power: 0.2,
    water: 0.2,
    traffic: 0.2,
    sewage: 0.15,
    waste: 0.15,
    internet: 0.1
};

export const startSimulation = (io) => {
    ioInstance = io;
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(async () => {
        try {
            const wards = await Ward.find();
            if (wards.length === 0) {
                console.log('[Simulation] No wards found. Seeding initial wards...');
                await seedInitialWards();
                return;
            }

            const updates = await Promise.all(wards.map(async (ward) => {
                // Random fluctuation +/- 2%
                RESOURCE_KEYS.forEach(key => {
                    let change = (Math.random() - 0.5) * 4;

                    // Apply disaster effects
                    if (currentDisaster) {
                        if (currentDisaster.type === 'Power Outage' && key === 'power') {
                            ward.resources[key].utilization = Math.min(100, ward.resources[key].utilization + 30); // High load/failure
                        } else if (currentDisaster.type === 'Flood' && (key === 'traffic' || key === 'sewage')) {
                            ward.resources[key].utilization = Math.min(100, ward.resources[key].utilization + 25);
                        } else if (currentDisaster.type === 'Traffic Jam' && key === 'traffic') {
                            ward.resources[key].utilization = Math.min(100, ward.resources[key].utilization + 40);
                        }
                    }

                    ward.resources[key].utilization = Math.max(10, Math.min(95, ward.resources[key].utilization + change));
                });

                // Calculate Ward Health Index (CHI)
                // Health = 100 - weighted_utilization (approx)
                let weightedUtil = 0;
                RESOURCE_KEYS.forEach(key => {
                    weightedUtil += ward.resources[key].utilization * (WEIGHTS[key] || 0.1);
                });

                ward.currentHealthIndex = Math.max(0, Math.min(100, 100 - (weightedUtil - 30) * 1.2)); // Adjusted for realism
                ward.lastSimulationUpdate = new Date();
                await ward.save();

                // Save time-series reading
                await SensorReading.create({
                    ward: ward._id,
                    readings: {
                        power: { utilization: ward.resources.power.utilization },
                        water: { utilization: ward.resources.water.utilization },
                        traffic: { utilization: ward.resources.traffic.utilization },
                        sewage: { utilization: ward.resources.sewage.utilization },
                        waste: { utilization: ward.resources.waste.utilization },
                        internet: { utilization: ward.resources.internet.utilization }
                    },
                    healthIndexAtTime: ward.currentHealthIndex
                });

                return ward;
            }));

            // Calculate City Health Index
            const cityHealth = updates.reduce((acc, w) => acc + w.currentHealthIndex, 0) / updates.length;

            // Broadcast
            ioInstance.emit('ward_updates', updates);
            ioInstance.emit('city_health_update', {
                score: Math.round(cityHealth),
                timestamp: new Date(),
                activeDisaster: currentDisaster
            });

        } catch (err) {
            console.error('[Simulation Error]', err);
        }
    }, 5000);
};

export const triggerDisaster = (type, severity) => {
    if (type === 'None') {
        currentDisaster = null;
    } else {
        currentDisaster = { type, severity, startTime: new Date() };
    }
    if (ioInstance) {
        ioInstance.emit('disaster_update', currentDisaster);
    }
    return currentDisaster;
};

const seedInitialWards = async () => {
    const initialWards = [
        { wardId: 'W01', name: 'Indiranagar-East', zone: 'Commercial', population: 45000, location: { coordinates: [77.6408, 12.9784] } },
        { wardId: 'W02', name: 'Koramangala-South', zone: 'Residential', population: 60000, location: { coordinates: [77.6245, 12.9352] } },
        { wardId: 'W03', name: 'Silk Board-Central', zone: 'Industrial', population: 30000, location: { coordinates: [77.6233, 12.9177] } },
        { wardId: 'W04', name: 'Whitefield-Tech', zone: 'Industrial', population: 80000, location: { coordinates: [77.7271, 12.9846] } },
        { wardId: 'W05', name: 'Malleshwaram-Heritage', zone: 'Residential', population: 55000, location: { coordinates: [77.5681, 13.0031] } },
        { wardId: 'W06', name: 'Jayanagar-Green', zone: 'Residential', population: 50000, location: { coordinates: [77.5938, 12.9250] } },
        { wardId: 'W07', name: 'MG Road-CBD', zone: 'Commercial', population: 20000, location: { coordinates: [77.6101, 12.9767] } },
        { wardId: 'W08', name: 'BTM-Layout', zone: 'Residential', population: 70000, location: { coordinates: [77.6101, 12.9166] } },
        { wardId: 'W09', name: 'Peenya-Industrial', zone: 'Industrial', population: 40000, location: { coordinates: [77.5273, 13.0329] } },
        { wardId: 'W10', name: 'Hebbal-North', zone: 'Educational', population: 35000, location: { coordinates: [77.5913, 13.0358] } },
    ];

    for (const w of initialWards) {
        // Random starting utilization between 40-70%
        const resources = {};
        RESOURCE_KEYS.forEach(key => {
            resources[key] = {
                utilization: 40 + Math.random() * 30,
                capacity: 1000 + Math.random() * 2000,
                budget: 50000 + Math.random() * 100000
            };
        });
        await Ward.create({ ...w, resources });
    }
};
