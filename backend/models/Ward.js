import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    utilization: { type: Number, default: 0, min: 0, max: 100 }, // Percentage
    capacity: { type: Number, default: 1000 }, // Absolute capacity units
    budget: { type: Number, default: 100000 } // Allocated budget in local currency
}, { _id: false });

const wardSchema = new mongoose.Schema({
    wardId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    zone: { type: String, required: true, enum: ['Residential', 'Commercial', 'Industrial', 'Hospital', 'Educational', 'Slum'] },
    population: { type: Number, default: 0 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
        address: String
    },
    resources: {
        power: { type: resourceSchema, default: () => ({}) },
        water: { type: resourceSchema, default: () => ({}) },
        traffic: { type: resourceSchema, default: () => ({}) },
        sewage: { type: resourceSchema, default: () => ({}) },
        waste: { type: resourceSchema, default: () => ({}) },
        internet: { type: resourceSchema, default: () => ({}) }
    },
    currentHealthIndex: { type: Number, default: 100, min: 0, max: 100 },
    lastSimulationUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

wardSchema.index({ location: '2dsphere' });

const Ward = mongoose.model('Ward', wardSchema);
export default Ward;
