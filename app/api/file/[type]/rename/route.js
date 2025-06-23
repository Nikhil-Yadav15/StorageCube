import { asyncHandler } from "../../../../../lib/utils/asyncHandler";
import { verifyJWT } from "../../../../../lib/middlewares/verifyJwt";
import { utils } from "../../../../../lib/utils/server-utils";
import connectDB from "../../../../../lib/dbConnection";
import File from "../../../../../lib/models/file.model";

export const PUT = asyncHandler(
  verifyJWT(async (req, { params }) => {
    try {
      await connectDB();
      const { type: id } = (await params) || "";
      const { name } = await req.json();

      if (!name) {
        return utils.responseHandler({
          message: "File name is missing",
          status: 400,
          success: false,
        });
      }

      const file = await File.findById(id);

      if (!file) {
        return utils.responseHandler({
          message: "File not found",
          status: 404,
          success: false,
        });
      }

      if (file.owner.toString() !== req.user._id.toString()) {
        return utils.responseHandler({
          message: "You are not authorized to rename this file",
          status: 401,
          success: false,
        });
      }

      const newName =
        name.split(".").length > 1 ? name : name + "." + file.extension;
      const updatedFile = await File.findOneAndUpdate(
        { _id: id },
        { name: newName },
        { new: true }
      );

      return utils.responseHandler({
        message: "File renamed successfully",
        data: {
          file: updatedFile,
        },
        status: 200,
        success: true,
      });
    } catch (error) {
      return utils.responseHandler({
        message: error.message || "Internal Server Error while renaming file",
        status: error.status || 500,
        success: false,
      });
    }
  })
);
