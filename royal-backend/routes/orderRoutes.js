// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const sendOrderWhatsapp = require("../utils/sendWhatsapp");

// GET ALL ORDERS
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.put("/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE NEW ORDER (POST)
router.post("/orders", async (req, res) => {
  try {
    const { 
      customerName, email, phone, address, city, state, pincode, 
      items, total, status, paymentStatus 
    } = req.body;

    if (!customerName || !email || !items || !total) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    const newOrder = new Order({
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      items,
      total,
      status: status || "Pending",
      paymentStatus: paymentStatus || "Pending"
    });

    await newOrder.save();
    
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("items.product", "name");

    await sendOrderWhatsapp(populatedOrder);

    // Send WhatsApp to Admin
    // await sendOrderWhatsapp(newOrder);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order" 
    });
  }
});

// DELETE ORDER
router.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
});


router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;