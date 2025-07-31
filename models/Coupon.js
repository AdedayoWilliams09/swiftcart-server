import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount: { type: Number, required: true, min: 1, max: 100 }, // percent
  expiry: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;