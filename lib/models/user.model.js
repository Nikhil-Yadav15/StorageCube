import { Schema, model, models } from "mongoose";
import jwt from "jsonwebtoken";
import { mongodbConfig } from "../dbConnection/config";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    totalSpaceUsed: {
      type: Number,
      default: 0,
    },
    totalSpace: {
      type: Number,
      default: 1 * 1024 * 1024 * 1024,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      avatar: this.avatar,
    },
    mongodbConfig.accessTokenSecret,
    {
      expiresIn: mongodbConfig.accessTokenExpiry,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    mongodbConfig.refreshTokenSecret,
    {
      expiresIn: mongodbConfig.refreshTokenExpiry,
    }
  );
};

const User = models?.User || model("User", userSchema);

export default User;
