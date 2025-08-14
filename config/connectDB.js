import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please provide MONGODB_URI in the .env file");
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB connect error", error);
    process.exit(1);
  }
}

export default connectDB;
