import Settings from '../models/settingsModel.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      settings.storeName = req.body.storeName || settings.storeName;
      settings.supportEmail = req.body.supportEmail || settings.supportEmail;
      settings.supportPhone = req.body.supportPhone || settings.supportPhone;
      settings.freeShippingThreshold = req.body.freeShippingThreshold ?? settings.freeShippingThreshold;
      settings.heroBanners = req.body.heroBanners || settings.heroBanners;

      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

export { getSettings, updateSettings };
