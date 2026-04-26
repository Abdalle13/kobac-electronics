import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const products = await Product.find({ ...keyword, status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch products', error: error.message });
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

// @desc    Toggle product status (Active/Archived)
// @route   PUT /api/products/:id/status
// @access  Private/Admin
const toggleProductStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.status = product.status === 'Active' ? 'Archived' : 'Active';
    const updatedProduct = await product.save();
    res.json({ message: `Product ${updatedProduct.status === 'Archived' ? 'archived' : 'reactivated'}`, product: updatedProduct });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const {
    name,
    price,
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

export { getProducts, getProductById, createProduct, toggleProductStatus, updateProduct };
