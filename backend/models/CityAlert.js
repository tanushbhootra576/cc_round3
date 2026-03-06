import mongoose from 'mongoose';

const cityAlertSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['traffic', 'water', 'power', 'drainage', 'construction', 'pollution', 'other'],
        },
        severity: {
            type: String,
            enum: ['info', 'warning', 'critical'],
            default: 'info',
        },
        zone: {
            type: String,
            trim: true,
            default: '',
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

cityAlertSchema.index({ location: '2dsphere' });

const CityAlert = mongoose.model('CityAlert', cityAlertSchema);
export default CityAlert;
