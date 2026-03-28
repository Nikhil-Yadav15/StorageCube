import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { utils } from "../../../../lib/utils/server-utils";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../../../lib/utils/cloudinary";
import { getFileType } from "../../../../lib/utils/utils";
import connectDB from "../../../../lib/dbConnection";
import File from "../../../../lib/models/file.model";
import User from "../../../../lib/models/user.model";

export const POST = asyncHandler(async (req) => {
  try {
    await connectDB();
    const decodedToken = utils.verifyJWT(req);
    const currentUser = await utils.fetchCurrentUser(decodedToken);
    
    const formData = await req.formData();
    const formDataFile = await formData.get("file");
    const ownerId = currentUser._id;

    if (!formDataFile) {
      return utils.responseHandler({
        message: "File is missing",
        status: 400,
        success: false,
      });
    }

    const fileResponse = await uploadOnCloudinary(formDataFile);

    if (!fileResponse) {
      return utils.responseHandler({
        message: "Failed to upload file",
        status: 500,
        success: false,
      });
    }

    const user = await User.findById(ownerId);

    if (!user) {
      return utils.responseHandler({
        message: "User not found",
        status: 404,
        success: false,
      });
    }

    // Atomically check and increment storage to prevent race conditions
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: ownerId,
        $expr: { $lte: [{ $add: ["$totalSpaceUsed", fileResponse.bytes] }, "$totalSpace"] },
      },
      {
        $inc: { totalSpaceUsed: fileResponse.bytes },
      },
      { new: true }
    );

    if (!updatedUser) {
      await deleteFromCloudinary(fileResponse.url);
      return utils.responseHandler({
        message: "You have reached your storage limit",
        status: 400,
        success: false,
      });
    }

    const fileDocument = {
      type: getFileType(formDataFile.name).type,
      name: formDataFile.name,
      url: fileResponse.url,
      extension: getFileType(formDataFile.name).extension,
      size: fileResponse.bytes,
      owner: ownerId,
      users: [],
    };

    const createdFile = await File.create(fileDocument);
    const existedFile = await File.findById(createdFile._id)
      .select("-createdAt -updatedAt -__v")
      .lean();

    if (!existedFile) {
      return utils.responseHandler({
        message: "Something went wrong while uploading file",
        status: 500,
        success: false,
      });
    }

    return utils.responseHandler({
      message: "File uploaded successfully",
      status: 200,
      success: true,
      data: {
        file: existedFile,
      },
    });
  } catch (error) {
    return utils.responseHandler({
      message: error.message || "Internal Server Error while uploading file",
      status: error.status || 500,
      success: false,
    });
  }
});
