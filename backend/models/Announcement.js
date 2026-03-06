import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'maintenance', 'emergency', 'event'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
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

// Auto-expire: mark inactive if past expiresAt
announcementSchema.pre('find', function () {
  // No-op here — expiry checked at query time in controller
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
