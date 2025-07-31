import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shipping: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  currency: { type: String, default: 'USD' },
  payment: {
    method: String, // 'stripe', 'paystack', etc.
    status: { type: String, default: 'pending' }, // 'pending', 'paid', 'failed'
    paymentId: String, // Stripe/Paystack/Flutterwave payment reference
  },
  total: Number,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  statusHistory: [{
    status: String,
    date: Date,
  }],
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;