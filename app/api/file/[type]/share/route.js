import { asyncHandler } from "../../../../../lib/utils/asyncHandler";
import { verifyJWT } from "../../../../../lib/middlewares/verifyJwt";
import { utils } from "../../../../../lib/utils/server-utils";
import connectDB from "../../../../../lib/dbConnection";
import File from "../../../../../lib/models/file.model";

export const PUT = asyncHandler(
  verifyJWT(async (req, { params }) => {
    try {
      await connectDB();
      const { type: id } = (await params) || [];
      const { emails } = await req.json();

      if (!emails) {
        return utils.responseHandler({
          message: `${Array.isArray(emails) ? "Emails" : "Email"} are missing`,
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
        if (Array.isArray(emails)) {
          return utils.responseHandler({
            message: "You are not authorized to share this file",
            status: 401,
            success: false,
          });
        }

        if (emails !== req.user.email) {
          return utils.responseHandler({
            message: "You are not authorized to remove this file",
            status: 401,
            success: false,
          });
        }

        file.users = file.users.filter((e) => e !== emails);
        await file.save();

        return utils.responseHandler({
          message: "File removed successfully",
          data: {
            file: file,
          },
          status: 200,
          success: true,
        });
      }

      file.users = Array.isArray(emails)
        ? [...file.users, ...emails.map((e) => e.trim())]
        : file.users.filter((e) => e !== emails);

      await file.save();

      return utils.responseHandler({
        message: `${Array.isArray(emails) ? "File shared" : "File removed"} successfully`,
        data: {
          file: file,
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
  })
);
