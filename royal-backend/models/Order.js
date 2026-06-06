const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,

  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product" 
    },
    quantity: { type: Number, default: 1 },
    price: Number
  }],

  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"], 
    default: "Pending" 
  },
  paymentStatus: { 
    type: String, 
    default: "Pending" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);