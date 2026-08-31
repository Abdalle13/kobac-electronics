import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1, numReviews: -1 },
  name_asc: { name: 1 },
};

// @desc    Fetch products (filtered, sorted, paginated)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const filter = {};

    if (req.query.keyword) {
      filter.name = { $regex: req.query.keyword, $options: 'i' };
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;

    const min = Number(req.query.minPrice);
    const max = Number(req.query.maxPrice);
    if (!Number.isNaN(min) && req.query.minPrice !== '') filter.price = { ...filter.price, $gte: min };
    if (!Number.isNaN(max) && req.query.maxPrice !== '') filter.price = { ...filter.price, $lte: max };

    if (req.query.minRating) filter.rating = { $gte: Number(req.query.minRating) };
    if (req.query.inStock === 'true') filter.countInStock = { $gt: 0 };

    const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .select('-reviews')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.max(Math.ceil(total / pageSize), 1),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch products', error: error.message });
  }
};

// @desc    Best-selling products (by total quantity ordered)
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);

    const ranked = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', sold: { $sum: '$orderItems.qty' } } },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ]);

    const ids = ranked.map((r) => r._id);
    const products = await Product.find({
      _id: { $in: ids },
    }).select('-reviews');

    // Preserve the sold-ranking order and attach the sold count
    const soldMap = Object.fromEntries(ranked.map((r) => [String(r._id), r.sold]));
    const ordered = products
      .map((p) => ({ ...p.toObject(), sold: soldMap[String(p._id)] || 0 }))
      .sort((a, b) => b.sold - a.sold);

    // Not enough sales yet? Pad with the newest products so the section is never empty.
    if (ordered.length < limit) {
      const fill = await Product.find({
        _id: { $nin: ordered.map((p) => p._id) },
      })
        .select('-reviews')
        .sort({ createdAt: -1 })
        .limit(limit - ordered.length);

      ordered.push(...fill.map((p) => ({ ...p.toObject(), sold: 0 })));
    }

    res.json(ordered);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch best sellers', error: error.message });
  }
};

// @desc    Most recent high-rated reviews across the catalogue (for the homepage)
// @route   GET /api/products/reviews/recent
// @access  Public
const getRecentReviews = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);

    const rows = await Product.aggregate([
      { $match: { 'reviews.0': { $exists: true } } },
      { $unwind: '$reviews' },
      { $match: { 'reviews.rating': { $gte: 4 } } },
      { $sort: { 'reviews.createdAt': -1 } },
      { $limit: limit },
      {
        $project: {
          _id: '$reviews._id',
          name: '$reviews.name',
          rating: '$reviews.rating',
          comment: '$reviews.comment',
          createdAt: '$reviews.createdAt',
          productId: '$_id',
          productName: '$name',
        },
      },
    ]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch reviews', error: error.message });
  }
};

// @desc    Every review across the catalogue (for admin moderation)
// @route   GET /api/products/reviews/all
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const rows = await Product.aggregate([
      { $match: { 'reviews.0': { $exists: true } } },
      { $unwind: '$reviews' },
      { $sort: { 'reviews.createdAt': -1 } },
      { $limit: 500 },
      {
        $project: {
          _id: '$reviews._id',
          name: '$reviews.name',
          rating: '$reviews.rating',
          comment: '$reviews.comment',
          createdAt: '$reviews.createdAt',
          productId: '$_id',
          productName: '$name',
        },
      },
    ]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch reviews', error: error.message });
  }
};

// @desc    Available filter options (categories, brands, price range) for the shop
// @route   GET /api/products/filters
// @access  Public
const getProductFilters = async (req, res) => {
  try {
    const base = {};
    const [categories, brands, priceAgg] = await Promise.all([
      Product.distinct('category', base),
      Product.distinct('brand', base),
      Product.aggregate([
        { $match: base },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
    ]);

    res.json({
      categories: categories.filter(Boolean).sort(),
      brands: brands.filter(Boolean).sort(),
      priceRange: priceAgg[0]
        ? { min: Math.floor(priceAgg[0].min), max: Math.ceil(priceAgg[0].max) }
        : { min: 0, max: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch filters', error: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Invalid Product ID or database error', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    images: ['/images/sample.jpg'],
    brand: 'Sample brand',
    category: 'Phone',
    countInStock: 0,
    description: 'Sample description',
    technicalSpecs: {}
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const {
    name,
    price,
    costPrice,
    description,
    images,
    brand,
    category,
    countInStock,
    technicalSpecs,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    if (costPrice !== undefined) product.costPrice = Number(costPrice) || 0;
    product.description = description;
    product.images = images;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.technicalSpecs = technicalSpecs;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to delete product', error: error.message });
  }
};

// Recalculate a product's aggregate rating fields from its reviews array
const recalcRating = (product) => {
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.length
    ? Number(
        (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(2)
      )
    : 0;
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private (must have ordered the product)
const createProductReview = async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = (req.body.comment || '').trim();

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }
  if (!comment) {
    res.status(400);
    throw new Error('Please add a comment');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const hasOrdered = await Order.exists({
    user: req.user._id,
    'orderItems.product': product._id,
    status: { $ne: 'Cancelled' },
  });
  if (!hasOrdered) {
    res.status(403);
    throw new Error('You can only review products you have ordered');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });
  recalcRating(product);
  await product.save();

  res.status(201).json({ message: 'Review added', rating: product.rating, numReviews: product.numReviews });
};

// @desc    Delete a product review (moderation)
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteProductReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.deleteOne();
  recalcRating(product);
  await product.save();

  res.json({ message: 'Review removed', rating: product.rating, numReviews: product.numReviews });
};

export {
  getProducts,
  getBestSellers,
  getRecentReviews,
  getAllReviews,
  getProductFilters,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview,
};
