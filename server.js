const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/index.env" });
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
