import { v2 as cloudinary } from "cloudinary";
import { mongodbConfig } from "../dbConnection/config";

// Configuration
cloudinary.config({
  cloud_name: mongodbConfig.cloudinaryCloudName,
  api_key: mongodbConfig.cloudinaryApiKey,
  api_secret: mongodbConfig.cloudinaryApiSecret,
});

const uploadOnCloudinary = async (file: File) => {
  // Upload the file on Cloudinary
  try {
    if (!file) return null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract the file name without extension
    const originalFileName = file.name.replace(/\.[^/.]+$/, "");

    // Convert to Base64
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const response = await cloudinary.uploader.upload(base64Data, {
      resource_type: "auto",
      public_id: originalFileName,
      folder: "cloud-store",
    });

    console.log("file is uploaded on cloudinary", response.url);
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

const deleteFromCloudinary = async (publicURL: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicURL);
    return result;
  } catch (error) {
    console.log("error at cloudinary delete function", error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
