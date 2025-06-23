import mongoose from "mongoose";
import { mongodbConfig } from "./config";

let connected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  // If the database is already connected, don't connect again
  if (connected) {
    console.log("MongoDB is already connected...");
    return;
  }

  // Connect to MongoDB
  try {
    const connectionInstance = await mongoose.connect(mongodbConfig.mongodbUri);
    connected = true;
    console.log(
      `\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
