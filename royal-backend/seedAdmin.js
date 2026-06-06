const connectDB = require('./config/db');
const Admin = require('./models/Admin');
require('dotenv').config();
const dns = require('dns');

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
])

connectDB();

const createAdmin = async () => {
  try {
    await Admin.create({
      name: "Yash Admin",
      email: "admin@royalgadget.com",
      password: "admin123"
    });
    console.log("✅ Admin Created Successfully!");
    process.exit();
  } catch (err) {
    console.log("Error:", err.message);
    process.exit(1);
  }
};

createAdmin();