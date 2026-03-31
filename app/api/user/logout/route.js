import { NextResponse } from "next/server";
import User from "../../../../lib/models/user.model";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { verifyJWT } from "../../../../lib/middlewares/verifyJwt";
import { utils } from "../../../../lib/utils/server-utils";
import connectDB from "../../../../lib/dbConnection";

const cookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: new Date(0),
};

export const POST = asyncHandler(
  verifyJWT(async (req) => {
    try {
      await connectDB();

      await User.findByIdAndUpdate(
        req.user._id,
        {
          $unset: {
            refreshToken: 1,
          },
        },
        {
          new: true,
        },
      );

      const response = utils.responseHandler({
        message: "User logged out Successfully",
        status: 200,
        success: true,
        data: {},
      });

      response.cookies.set("accessToken", "", cookieOptions);
      response.cookies.set("refreshToken", "", cookieOptions);

      return response;
    } catch (error) {
      return utils.responseHandler({
        message: error.message || "Internal Server Error while logging out",
        status: error.status || 500,
        success: false,
      });
    }
  }),
);
