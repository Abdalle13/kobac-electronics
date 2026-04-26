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
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
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
