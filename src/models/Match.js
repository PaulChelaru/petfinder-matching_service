import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    matchId: {
        type: String,
        required: true,
        unique: true,
    },
    lostAnnouncementId: {
        type: String,
        required: true,
        ref: "Announcement",
    },
    foundAnnouncementId: {
        type: String,
        required: true,
        ref: "Announcement",
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "rejected"],
        default: "pending",
    },
    distance: {
        type: Number,
        min: 0,
        default: 0,
    },
    timeDifference: {
        type: Number,
        min: 0,
        default: 0,
    },
}, {
    timestamps: true,
});

// Prevent duplicate matches
matchSchema.index(
    { lostAnnouncementId: 1, foundAnnouncementId: 1 },
    { unique: true },
);

// Index for queries
matchSchema.index({ matchId: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ confidence: -1 });
matchSchema.index({ createdAt: -1 });

const Match = mongoose.model("Match", matchSchema);

export default Match;
