import mongoose, { Schema } from 'mongoose';
const businessWalletSchema = new Schema({
    channel_id: { type: Schema.Types.ObjectId, ref: 'PaymentChannel', required: true },
    wallet_address: { type: String, required: true },
    currency_type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    qr_code: { type: String, default: '' },
}, { timestamps: true });
export const BusinessWallet = mongoose.model('BusinessWallet', businessWalletSchema);
