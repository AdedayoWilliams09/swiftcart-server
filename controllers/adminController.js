import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  const totalSales = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
  const ordersCount = await Order.countDocuments();
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const bestsellers = await Product.find().sort({ rating: -1, numReviews: -1 }).limit(5);
  const lowStock = await Product.find({ stock: { $lte: 5 } }).limit(5);

  res.json({
    totalSales: totalSales[0]?.total || 0,
    ordersCount,
    usersCount,
    productsCount,
    bestsellers,
    lowStock,
  });
};

// Get all orders
export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email');
  res.json(orders);
};

// Get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// Coupon CRUD
export const createCoupon = async (req, res) => {
  const { code, discount, expiry, usageLimit } = req.body;
  const coupon = await Coupon.create({ code, discount, expiry, usageLimit });
  res.status(201).json(coupon);
};
export const getCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
};
export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json(coupon);
};
export const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json({ message: 'Coupon deleted' });
};

// Banner CRUD
export const createBanner = async (req, res) => {
  const { image, link, title, description, active } = req.body;
  const banner = await Banner.create({ image, link, title, description, active });
  res.status(201).json(banner);
};
export const getBanners = async (req, res) => {
  const banners = await Banner.find();
  res.json(banners);
};
export const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json(banner);
};
export const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json({ message: 'Banner deleted' });
};


export const getAllReviews = async (req, res) => {
  // Flatten all reviews from all products
  const products = await Product.find({}, 'name reviews');
  const reviews = [];
  products.forEach(product => {
    product.reviews.forEach(review => {
      reviews.push({
        ...review.toObject(),
        productId: product._id,
        productName: product.name,
      });
    });
  });
  res.json(reviews);
};

// Approve or hide a review
export const updateReviewStatus = async (req, res) => {
  const { productId, reviewId } = req.params;
  const { status } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
  if (reviewIndex === -1) return res.status(404).json({ message: 'Review not found' });

  product.reviews[reviewIndex].status = status;
  product.markModified('reviews');
  await product.save();
  res.json({ message: `Review ${status}` });
};



// Delete a review
export const deleteReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Remove the review using pull
  product.reviews.pull({ _id: reviewId });
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / (product.numReviews || 1);
  await product.save();
  res.json({ message: 'Review deleted' });
};