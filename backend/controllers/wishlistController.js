import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// @desc    Get the current user's wishlist (populated, active products only)
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: '-reviews',
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Drop any nulls left by deleted products
  const items = (user.wishlist || []).filter(Boolean);
  res.json(items);
};

// @desc    Add a product to the wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  const already = user.wishlist.some((id) => id.toString() === productId);
  if (!already) {
    user.wishlist.push(productId);
    await user.save();
  }

  res.status(201).json(user.wishlist);
};

// @desc    Remove a product from the wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  res.json(user.wishlist);
};

export { getWishlist, addToWishlist, removeFromWishlist };
