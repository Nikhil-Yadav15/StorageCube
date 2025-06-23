import User from "../../../../lib/models/user.model";
import { utils } from "../../../../lib/utils/server-utils";
import { avatarPlaceholderUrl } from "@/constants";
import connectDB from "../../../../lib/dbConnection";

export const POST = async (req) => {
  try {
    await connectDB();

    const { fullName, email } = await req.json();

    const isFieldEmpty = [fullName, email].some(
      (field) => field?.trim() === ""
    );

    if (isFieldEmpty) {
      return utils.responseHandler({
        message: "All fields are required",
        status: 400,
        success: false,
      });
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return utils.responseHandler({
        message: "User with email or username already exists",
        status: 409,
        success: false,
      });
    }

    const otpDetails = await utils.sendEmailOTP(email, fullName);

    if (!otpDetails) {
      return utils.responseHandler({
        message: "Something went wrong while sending OTP",
        status: 500,
        success: false,
      });
    }

    const { otp, expiration } = otpDetails;

    const user = await User.create({
      fullName,
      email,
      avatar: avatarPlaceholderUrl,
      emailVerificationToken: otp,
      emailVerificationExpiry: expiration,
      isEmailVerified: false,
    });

    const createdUser = await User.findById(user._id).select("-refreshToken");

    if (!createdUser) {
      return utils.responseHandler({
        message: "Something went wrong while registering the user",
        status: 500,
        success: false,
      });
    }

    return utils.responseHandler({
      message: "OTP sent successfully",
      status: 200,
      success: true,
      data: {
        emailVerificationToken: createdUser.emailVerificationToken,
        emailVerificationExpiry: createdUser.emailVerificationExpiry,
      },
    });
  } catch (error) {
    return utils.responseHandler({
      message: error.message,
      status: 500,
      success: false,
    });
  }
};
