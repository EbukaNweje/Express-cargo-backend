const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables - try multiple paths for different environments
if (process.env.NODE_ENV !== "production") {
  // Local development
  dotenv.config({ path: "./config/index.env" });
} else {
  // Production - Vercel will use .env or dashboard variables
  dotenv.config();
}

// Debug environment loading
console.log("=== SERVER ENV DEBUG ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("JWT from server.js:", process.env.JWT ? "loaded" : "not loaded");
console.log(
  "DATABASE from server.js:",
  process.env.DATABASE ? "loaded" : "not loaded",
);
console.log("========================");

const Db = process.env.DATABASE;

// Optimize for serverless
// mongoose.set("bufferCommands", false);
// mongoose.set("bufferMaxEntries", 0);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(Db, {
      // serverSelectionTimeoutMS: 30000,
      // socketTimeoutMS: 45000,
      // bufferMaxEntries: 0,
      // maxPoolSize: 10,
      // minPoolSize: 1,
      // maxIdleTimeMS: 30000,
    });
    isConnected = true;
    console.log("Database connected successfully");
  } catch (err) {
    console.log("Database connection error:", err.message);
    throw err;
  }
};

// Connect to database
connectDB().catch(console.error);

const app = require("./App");

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
