const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const dns = require('dns');

dns.setServers([
    '8.8.8.8',
    '1.1.1.1'
]);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// Routes (baad mein add karenge)
app.get('/', (req, res) => {
  res.json({ message: "Royal Mobile Gadget Backend Running! ✅" });
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// ... previous code
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const bannerRoutes = require('./routes/banners');   // 
const reviewRoutes = require('./routes/reviews');
// After other route imports
const orderRoutes = require("./routes/orderRoutes");

// Mount the routes
app.use("/api", orderRoutes);     // Important: /api prefix

// Protected Admin Routes (with auth middleware)
const protect = require('./middleware/auth');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reviews', reviewRoutes);

console.log("TWILIO SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TWILIO NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER);
console.log("ADMIN NUMBER:", process.env.ADMIN_WHATSAPP_NUMBER);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});