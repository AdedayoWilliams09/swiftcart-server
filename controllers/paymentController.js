import axios from 'axios';
import Order from '../models/Order.js';

export const createPaystackTransaction = async (req, res) => {
  const { orderId, email } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Paystack expects amount in kobo (NGN) or the lowest currency unit
  // For USD, use cents; for NGN, use kobo. Let's assume NGN for this example.
  const amount = Math.round(order.total * 100); // e.g. 5000 NGN => 500000 kobo

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email, // Customer's email
        amount,
        reference: `swiftcart_${order._id}_${Date.now()}`,
        callback_url: `${process.env.CLIENT_URL}/order-success/${order._id}`,
        metadata: {
          orderId: order._id.toString(),
        },
        currency: 'NGN', // Change to your currency
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || 'Paystack error' });
  }
};

// Webhook to verify payment (optional but recommended for production)
export const paystackWebhook = async (req, res) => {
  // Paystack will POST to this endpoint after payment
  // You should verify the event and update order status accordingly
  // For demo, just log the event
  console.log('Paystack webhook:', req.body);
  res.sendStatus(200);
};