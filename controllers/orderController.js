import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

// Place a new order
export const placeOrder = async (req, res) => {
  const { shipping, paymentMethod } = req.body;
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const items = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.images[0]?.url || '',
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user.id,
    items,
    shipping,
    payment: { method: paymentMethod, status: 'pending' },
    total,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', date: new Date() }],
  });

  // Optionally clear cart after order
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
};

// Get single order (user or admin)
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });
  res.json(order);
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  order.statusHistory.push({ status, date: new Date() });
  await order.save();

  const user = await User.findById(order.user);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email, // for demo
    subject: `Order #${order._id} Status Update`,
   html: `<p>Hello ${user.name},<br>Your order status has been updated to: <b>${status}</b>.</p>`,
  });

  res.json(order);
};