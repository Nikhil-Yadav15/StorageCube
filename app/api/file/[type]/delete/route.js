import { asyncHandler } from "../../../../../lib/utils/asyncHandler";
import { verifyJWT } from "../../../../../lib/middlewares/verifyJwt";
import { utils } from "../../../../../lib/utils/server-utils";
import connectDB from "../../../../../lib/dbConnection";
import File from "../../../../../lib/models/file.model";
import User from "../../../../../lib/models/user.model";
import { deleteFromCloudinary } from "../../../../../lib/utils/cloudinary";

export const DELETE = asyncHandler(
  verifyJWT(async (req, { params }) => {
    try {
      await connectDB();
      const { type: id } = (await params) || "";
      const existingFile = await File.findById(id);

      if (!existingFile) {
        return utils.responseHandler({
          message: "File not found",
          status: 404,
          success: false,
        });
      }

      if (existingFile.owner.toString() !== req.user._id.toString()) {
        return utils.responseHandler({
          message: "You are not authorized to delete this file",
          status: 401,
          success: false,
        });
      }

      const result = await File.deleteOne({ _id: id });

      if (!result) {
        return utils.responseHandler({
          message: "Something went wrong while deleting a video",
          status: 500,
          success: false,
        });
      }

      await deleteFromCloudinary(existingFile.url);

      await User.findOneAndUpdate(
        { _id: req.user._id },
        [
          {
            $set: {
              totalSpaceUsed: {
                $max: [
                  { $subtract: ["$totalSpaceUsed", existingFile.size] },
                  0,
                ],
              },
            },
          },
        ],
        { returnDocument: "after" }
      );

      return utils.responseHandler({
        message: "File deleted successfully",
        status: 200,
        success: true,
      });
    } catch (error) {
      return utils.responseHandler({
        message: error.message || "Internal Server Error while deleting file",
        status: error.status || 500,
        success: false,
      });
    }
  })
);
