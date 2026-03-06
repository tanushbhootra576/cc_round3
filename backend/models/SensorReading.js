import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema({
    ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
    timestamp: { type: Date, default: Date.now },
    readings: {
        power: { utilization: Number },
        water: { utilization: Number },
        traffic: { utilization: Number },
        sewage: { utilization: Number },
        waste: { utilization: Number },
        internet: { utilization: Number }
    },
    healthIndexAtTime: { type: Number }
});

sensorReadingSchema.index({ ward: 1, timestamp: -1 });

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);
export default SensorReading;
