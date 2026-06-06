const imagekit = require('../config/imagekit');

// Upload Single Image
const uploadSingleImage = async (file) => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,                    // Buffer from multer
      fileName: `${Date.now()}-${file.originalname}`,
      folder: '/royal-gadgets',             // Folder name in ImageKit
    });

    return {
      url: result.url,
      publicId: result.fileId
    };
  } catch (error) {
    console.error('ImageKit Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

// Upload Multiple Images
const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadSingleImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error('Multiple images upload failed');
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages
};