import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { NextResponse } from "next/server";
import { mongodbConfig } from "../dbConnection/config";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";

export function responseHandler({
  message = "",
  status,
  success = true,
  data = {},
}) {
  return NextResponse.json(
    {
      message,
      success,
      ...data,
    },
    { status }
  );
}

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong while generating tokens",
      },
      { status: 500 }
    );
  }
};

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, expiration };
};

const emailTemplate = (firstName, otp) => {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <p>Hello, ${firstName}!</p>
    <p>Enter the following verification code. This code is valid for 10 minutes.</p>
    <div style="border: 1px solid #ccc; padding: 10px; margin: 20px 0; display: inline-block; text-align: center; font-size: 1.5em; font-weight: bold;">
      ${otp.split("").join(" ")}
    </div>
    <p>If you did not request this code, please ignore this email.</p>
  </div>`;
};

const sendEmailOTP = async (email, firstName) => {
  const { otp, expiration } = generateOtp();

  try {
    const transporter = nodemailer.createTransporter({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `StorageCube <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: emailTemplate(firstName, otp),
    };

    const data = await transporter.sendMail(mailOptions);
    return data ? { otp, expiration } : null;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

const createClearCookiesResponse = (response) => {
  const res = response || new NextResponse();
  
  res.cookies.set("accessToken", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  res.cookies.set("refreshToken", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  return res;
};

const verifyJWT = (req) => {
  const token =
    req.cookies?.get("accessToken")?.value ||
    req.headers?.get("Authorization")?.replace("Bearer ", "");

  if (!token) throw new Error("Authorization token is missing");

  try {
    return jwt.verify(token, mongodbConfig.accessTokenSecret);
  } catch (error) {
    console.log(error);
    throw new Error("Token verification failed");
  }
};

const fetchCurrentUser = async (decodedToken) => {
  try {
    return await User.findById(decodedToken._id)
      .select("_id email fullName avatar")
      .lean();
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch user");
  }
};

export const utils = {
  responseHandler,
  generateAccessAndRefreshToken,
  createClearCookiesResponse,
  verifyJWT,
  fetchCurrentUser,
  sendEmailOTP,
};
