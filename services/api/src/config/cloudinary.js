require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const CloudinaryStorage  = require('multer-storage-cloudinary');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('ERROR: Cloudinary credentials are not defined in your .env file.');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// SIMPLIFIED STORAGE CONFIGURATION
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spot2go_places',
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

module.exports = {
  cloudinary,
  storage,
};