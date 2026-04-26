import path from 'path';
import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';

const router = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Broadly accept most common image extensions and mimetypes
  const filetypes = /jpg|jpeg|png|webp|gif|heic|heif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Increase limit to 20MB for high-res mobile photos
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload single image to ImageKit
// @route   POST /api/upload
// @access  Private
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const response = await imagekit.upload({
      file: req.file.buffer, // required, buffer from multer memory storage
      fileName: `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`, // required
      folder: '/kobac_electronics', // optional: store in a specific folder
    });

    res.send(response.url);
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).send('Image upload failed');
  }
});

export default router;
