import { NextResponse } from "next/server";
import User from "../../../../lib/models/user.model";
import { utils } from "../../../../lib/utils/server-utils";
import connectDB from "../../../../lib/dbConnection";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MINUTES = 15;

const POST = asyncHandler(async (req) => {
  await connectDB();

  const { email, code } = await req.json();
  const isFieldEmpty = [email, code].some((field) => field?.trim() === "");

  if (isFieldEmpty) {
    return utils.responseHandler({
      message: "All fields are required",
      status: 400,
      success: false,
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return utils.responseHandler({
      message: "User not found",
      status: 404,
      success: false,
    });
  }

  // Rate limiting: check if user has exceeded max attempts
  const now = new Date();
  const lockoutExpiry = user.otpLastAttempt
    ? new Date(user.otpLastAttempt.getTime() + OTP_LOCKOUT_MINUTES * 60 * 1000)
    : null;

  if (
    user.otpAttempts >= MAX_OTP_ATTEMPTS &&
    lockoutExpiry &&
    now < lockoutExpiry
  ) {
    const minutesLeft = Math.ceil((lockoutExpiry - now) / 60000);
    return utils.responseHandler({
      message: `Too many attempts. Try again in ${minutesLeft} minute(s).`,
      status: 429,
      success: false,
    });
  }

  // Reset attempts if lockout window has passed
  if (lockoutExpiry && now >= lockoutExpiry) {
    user.otpAttempts = 0;
  }

  if (!user.emailVerificationExpiry || user.emailVerificationExpiry < now) {
    return utils.responseHandler({
      message: "OTP has expired",
      status: 400,
      success: false,
    });
  }

  if (user.emailVerificationToken !== code) {
    // Increment failed attempts
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    user.otpLastAttempt = now;
    await user.save({ validateBeforeSave: false });

    return utils.responseHandler({
      message: "Invalid OTP",
      status: 400,
      success: false,
    });
  }

  // Success — reset attempts and clear OTP
  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        isEmailVerified: true,
        otpAttempts: 0,
        otpLastAttempt: null,
      },
    },
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -isEmailVerified -emailVerificationExpiry -refreshToken -createdAt -updatedAt -__v",
  );

  const { accessToken, refreshToken } =
    await utils.generateAccessAndRefreshToken(user._id);

  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  const response = NextResponse.json(
    {
      message: "OTP verified successfully",
      success: true,
      accessToken,
      refreshToken,
      user: loggedInUser,
    },
    { status: 200 },
  );

  response.cookies.set("accessToken", accessToken, cookieOptions);
  response.cookies.set("refreshToken", refreshToken, cookieOptions);

  return response;
});

export { POST };
