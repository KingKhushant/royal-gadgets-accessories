const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String
  },
  image: {
    url: {
      type: String,
      required: true
    },
    publicId: String   // ImageKit ke liye
  },
  link: {
    type: String,      // Kisi product/category ki link
    default: '#'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    enum: ['main', 'secondary', 'sidebar', 'flash'],
    default: 'main'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);