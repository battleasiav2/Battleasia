import mongoose, { Schema } from 'mongoose';
const participantSchema = new Schema({
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    pubgId: { type: String, default: '' },
    entryFee: { type: Number, default: 0 },
    placement: { type: Number, default: null },
    kills: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });
participantSchema.index({ matchId: 1, userId: 1 }, { unique: true });
export const MatchParticipant = mongoose.model('MatchParticipant', participantSchema);
