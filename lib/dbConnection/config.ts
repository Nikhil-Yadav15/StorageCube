export const mongodbConfig = {
  mongodbUri: process.env.MONGODB_URI!,
  dbName: process.env.DB_NAME!,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY!,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY!,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,
  gmailUser: process.env.GMAIL_USER!,
  gmailPassword: process.env.GMAIL_PASS!,
};
