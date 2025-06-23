import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "../../../../lib/models/user.model";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { utils } from "../../../../lib/utils/server-utils";
import { mongodbConfig } from "../../../../lib/dbConnection/config";
import connectDB from "../../../../lib/dbConnection";

export const POST = asyncHandler(async (req, _) => {
  const cookieStore = await cookies();

  const incomingRefreshToken =
    req.cookies?.get("refreshToken")?.value || req.body.refreshToken;

  if (!incomingRefreshToken) {
    utils.clearCookies(cookieStore);
    return utils.responseHandler({
      message: "unauthorized request",
      status: 401,
      success: false,
    });
  }

  try {
    await connectDB();

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      mongodbConfig.refreshTokenSecret
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return utils.responseHandler({
        message: "Invalid refresh token",
        status: 401,
        success: false,
      });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      utils.clearCookies(cookieStore);
      return utils.responseHandler({
        message: "Refresh token is expired or used",
        status: 401,
        success: false,
      });
    }

    const options = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    const { accessToken, refreshToken } =
      await utils.generateAccessAndRefreshToken(user._id);

    (await cookies()).set("accessToken", accessToken, options);
    (await cookies()).set("refreshToken", refreshToken, options);

    return utils.responseHandler({
      message: "Access token refreshed Successfully",
      status: 200,
      success: true,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    utils.clearCookies(cookieStore);

    return utils.responseHandler({
      message: "Something went wrong while refreshing access token!",
      status: 500,
      success: false,
    });
  }
});
