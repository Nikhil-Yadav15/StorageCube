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
          message: "Email(s) are required",
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

      const isOwner = file.owner.toString() === req.user._id.toString();

      if (Array.isArray(emails)) {
        // Adding users — only the owner can share
        if (!isOwner) {
          return utils.responseHandler({
            message: "You are not authorized to share this file",
            status: 401,
            success: false,
          });
        }
        file.users = [...file.users, ...emails.map((e) => e.trim())];
      } else {
        // Removing a user — owner can remove anyone, non-owner can only remove themselves
        if (!isOwner && emails !== req.user.email) {
          return utils.responseHandler({
            message: "You are not authorized to remove this user",
            status: 401,
            success: false,
          });
        }
        file.users = file.users.filter((e) => e !== emails);
      }

      await file.save();

      return utils.responseHandler({
        message: `${Array.isArray(emails) ? "File shared" : "User removed"} successfully`,
        data: {
          file,
        },
        status: 200,
        success: true,
      });
    } catch (error) {
      return utils.responseHandler({
        message: error.message || "Internal Server Error while updating file sharing",
        status: error.status || 500,
        success: false,
      });
    }
  })
);
