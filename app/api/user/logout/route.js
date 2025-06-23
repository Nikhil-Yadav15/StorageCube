import { cookies } from "next/headers";
import User from "../../../../lib/models/user.model";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { verifyJWT } from "../../../../lib/middlewares/verifyJwt";
import { utils } from "../../../../lib/utils/server-utils";
import connectDB from "../../../../lib/dbConnection";

export const POST = asyncHandler(
  verifyJWT(async (req, _) => {
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
        }
      );
      const cookieStore = await cookies();
      utils.clearCookies(cookieStore);

      return utils.responseHandler({
        message: "User logged out Successfully",
        status: 200,
        success: true,
        data: {},
      });
    } catch (error) {
      return utils.responseHandler({
        message: error.message || "Internal Server Error while logging out",
        status: error.status || 500,
        success: false,
      });
    }
  })
);
