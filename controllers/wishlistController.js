import Wishlist from '../models/Wishlist.js';

// Get wishlist
export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
  res.json(wishlist || { products: [] });
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user.id, products: [] });

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  res.json(wishlist);
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

  wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
  await wishlist.save();
  res.json(wishlist);
};