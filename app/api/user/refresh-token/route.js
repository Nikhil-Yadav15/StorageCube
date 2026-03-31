import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import User from "../../../../lib/models/user.model";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { utils } from "../../../../lib/utils/server-utils";
import { mongodbConfig } from "../../../../lib/dbConnection/config";
import connectDB from "../../../../lib/dbConnection";

const cookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const POST = asyncHandler(async (req) => {
  const cookieStore = await cookies();

  const incomingRefreshToken = cookieStore.get("refreshToken")?.value;

  if (!incomingRefreshToken) {
    const response = utils.responseHandler({
      message: "unauthorized request",
      status: 401,
      success: false,
    });
    response.cookies.set("accessToken", "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    response.cookies.set("refreshToken", "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    return response;
  }

  try {
    await connectDB();

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      mongodbConfig.refreshTokenSecret,
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
      const response = utils.responseHandler({
        message: "Refresh token is expired or used",
        status: 401,
        success: false,
      });
      response.cookies.set("accessToken", "", {
        ...cookieOptions,
        expires: new Date(0),
      });
      response.cookies.set("refreshToken", "", {
        ...cookieOptions,
        expires: new Date(0),
      });
      return response;
    }

    const { accessToken, refreshToken } =
      await utils.generateAccessAndRefreshToken(user._id);

    const response = utils.responseHandler({
      message: "Access token refreshed Successfully",
      status: 200,
      success: true,
      data: { accessToken, refreshToken },
    });

    response.cookies.set("accessToken", accessToken, cookieOptions);
    response.cookies.set("refreshToken", refreshToken, cookieOptions);

    return response;
  } catch (error) {
    console.error(error);
    const response = utils.responseHandler({
      message: "Something went wrong while refreshing access token!",
      status: 500,
      success: false,
    });
    response.cookies.set("accessToken", "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    response.cookies.set("refreshToken", "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    return response;
  }
});
