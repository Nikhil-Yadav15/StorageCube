import mongoose from "mongoose";
import { mongodbConfig } from "./config";

let connected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (connected) {
    console.log("MongoDB is already connected...");
    return;
  }

  if (!mongodbConfig.mongodbUri) {
    throw new Error("MongoDB URI is not configured");
  }

  try {
    const connectionInstance = await mongoose.connect(mongodbConfig.mongodbUri);
    connected = true;
    console.log(
      `\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error", error);
    throw error;
  }
};

export default connectDB;
