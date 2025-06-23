import User from "../../../../lib/models/user.model";
import { utils } from "../../../../lib/utils/server-utils";
import { cookies } from "next/headers";
import connectDB from "../../../../lib/dbConnection";

const POST = async (req) => {
  try {
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
    if (user.emailVerificationExpiry < new Date()) {
      return utils.responseHandler({
        message: "OTP has expired",
        status: 400,
        success: false,
      });
    }

    if (user.emailVerificationToken !== code) {
      return utils.responseHandler({
        message: "Invalid OTP",
        status: 400,
        success: false,
      });
    }

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          isEmailVerified: true,
        },
      }
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -emailVerificationToken -isEmailVerified -emailVerificationExpiry -refreshToken -createdAt -updatedAt -__v"
    );

    const { accessToken, refreshToken } =
      await utils.generateAccessAndRefreshToken(user._id);

    const options = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    (cookies()).set("accessToken", accessToken, options);
    (cookies()).set("refreshToken", refreshToken, options);

    return utils.responseHandler({
      message: "OTP verified successfully",
      status: 200,
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: loggedInUser,
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

export { POST };
