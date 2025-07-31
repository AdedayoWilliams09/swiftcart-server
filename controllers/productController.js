import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';

// Create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, variants } = req.body;
    let images = [];

    if (req.files) {
      images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const product = await Product.create({
      name,
      description,
      price,
      images,
      category,
      brand,
      stock,
      variants: variants ? JSON.parse(variants) : [],
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all products (with search, filter, pagination)
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      rating,
    } = req.query;

    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (rating) query.rating = { $gte: Number(rating) };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, variants } = req.body;
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Handle new images
    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      product.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock || product.stock;
    product.variants = variants ? JSON.parse(variants) : product.variants;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a review to a product
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent duplicate review
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
