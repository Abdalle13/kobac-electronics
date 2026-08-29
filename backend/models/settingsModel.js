import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema(
  {
    storeName: { type: String, default: 'Kobac Electronics' },
    supportEmail: { type: String, default: 'cabdale13yare@gmail.com' },
    supportPhone: { type: String, default: '+252 61 XXXXXXX' },
    freeShippingThreshold: { type: Number, default: 400 },
    heroBanners: [{ type: String }], // URLs to banner images
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
