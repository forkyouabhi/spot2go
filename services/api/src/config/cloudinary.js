require('dotenv').config();
// FIX 1: Import the ROOT Cloudinary object (not .v2) for the storage engine
const cloudinary = require('cloudinary');

// FIX 2: Robust import for CloudinaryStorage to handle version differences
const multerStorage = require('multer-storage-cloudinary');
const CloudinaryStorage = multerStorage.CloudinaryStorage || multerStorage;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('ERROR: Cloudinary credentials are not defined in your .env file.');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  process.exit(1);
}

// Configure using the v2 interface
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  // FIX 3: Pass the ROOT cloudinary object. 
  // The library internally calls `cloudinary.v2.uploader...`
  cloudinary: cloudinary, 
  params: {
    folder: 'spot2go_places',
    // FIX 4: Use 'allowedFormats' (camelCase) for newer versions
    allowedFormats: ['jpeg', 'png', 'jpg'], 
  },
});

module.exports = {
  cloudinary: cloudinary.v2, // Export v2 for use in your controllers
  storage,
};