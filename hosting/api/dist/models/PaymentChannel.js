import mongoose, { Schema } from 'mongoose';
const paymentChannelSchema = new Schema({
    channel_name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
}, { timestamps: true });
export const PaymentChannel = mongoose.model('PaymentChannel', paymentChannelSchema);
