import mongoose from 'mongoose';
import Ward from '../backend/models/Ward.js';
import SensorReading from '../backend/models/SensorReading.js';

const MONGO_URI = 'mongodb://localhost:27017/civicplus';

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const wards = await Ward.find();
        console.log(`Found ${wards.length} wards`);

        if (wards.length > 0) {
            console.log('Sample Ward:', wards[0].name, 'CHI:', wards[0].currentHealthIndex);
        }

        const readings = await SensorReading.countDocuments();
        console.log(`Found ${readings} sensor readings`);

        if (readings > 0) {
            const latest = await SensorReading.findOne().sort({ timestamp: -1 });
            console.log('Latest Reading Time:', latest.timestamp);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Verification failed:', err);
    }
}

verify();
