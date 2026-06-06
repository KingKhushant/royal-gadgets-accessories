const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {        // For discount
    type: Number
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: String,     // Optional
  description: String,
  images: [{
    url: String,           // ImageKit URL
    publicId: String       // ImageKit fileId (important for delete)
  }],
  stock: {
    type: Number,
    default: 1
  },
  isFlashSale: {
    type: Boolean,
    default: false
  },
  discount: Number,        // Percentage
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);