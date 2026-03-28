import User from "../../../../lib/models/user.model";
import { utils } from "../../../../lib/utils/server-utils";
import connectDB from "../../../../lib/dbConnection";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

export const POST = asyncHandler(async (req) => {
    
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return utils.responseHandler({
        message: "Email is required",
        status: 400,
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return utils.responseHandler({
        message: "Invalid email format",
        status: 400,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return utils.responseHandler({
        message: "User with this email does not exist",
        status: 404,
        success: false,
      });
    }

    const otpDetails = await utils.sendEmailOTP(email, user.fullName);

    if (!otpDetails) {
      return utils.responseHandler({
        message: "Something went wrong while sending OTP",
        status: 500,
        success: false,
      });
    }

    const { otp, expiration } = otpDetails;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          emailVerificationToken: otp,
          emailVerificationExpiry: expiration,
          isEmailVerified: false,
        },
      },
      { returnDocument: "after" }
    );

    return utils.responseHandler({
      message: "OTP sent successfully",
      status: 200,
      success: true,
      data: {
        email: updatedUser.email,
      },
    });
});
