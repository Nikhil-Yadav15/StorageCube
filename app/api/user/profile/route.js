import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { utils } from "../../../../lib/utils/server-utils";
import connectDB from "../../../../lib/dbConnection";

export const GET = asyncHandler(async (req, _) => {
  try {
    await connectDB();
    const decodedToken = utils.verifyJWT(req);
    const currentUser = await utils.fetchCurrentUser(decodedToken);

    return utils.responseHandler({
      message: "User profile fetched successfully",
      data: {
        user: currentUser,
      },
      status: 200,
      success: true,
    });
  } catch (error) {
    return utils.responseHandler({
      message: error.message || "Internal Server Error while fetching user",
      status: error.status || 500,
      success: false,
    });
  }
});
