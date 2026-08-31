import crypto from 'crypto';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import sendEmail, { queueEmail } from '../utils/sendEmail.js';
import { welcomeEmail, passwordResetEmail } from '../utils/emailTemplates.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.status === 'INACTIVE') {
    res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    return;
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(res, user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // In prod this is awaited (serverless would otherwise drop it); in dev it
    // is fire-and-forget so a slow send can't stall the response.
    const { subject, html } = welcomeEmail(user.name);
    await queueEmail({ to: user.email, subject, html });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(res, user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(res, updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'Admin' && user._id.toString() === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot deactivate your own admin account' });
      return;
    }
    
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Request a password reset link
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Always return the same response — don't reveal whether an account exists.
  const genericResponse = {
    message: 'If an account exists for that email, a reset link has been sent.',
  };

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (!user || user.status === 'INACTIVE') {
    return res.json(genericResponse);
  }

  const rawToken = user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || ''}/reset-password/${rawToken}`;
  const { subject, html } = passwordResetEmail(user.name, resetUrl);
  const result = await sendEmail({ to: user.email, subject, html });

  if (result.error) {
    // Roll back the token so a broken mailer doesn't lock the flow
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
  }

  res.json(genericResponse);
};

// @desc    Reset password using the emailed token
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired' });
  }

  user.password = password; // pre('save') hook hashes it
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(res, user._id),
  });
};

export {
  authUser,
  registerUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
  toggleUserStatus,
  forgotPassword,
  resetPassword,
};
