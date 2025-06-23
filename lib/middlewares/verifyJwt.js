// import jwt from "jsonwebtoken";
// import User from "../models/user.model";
// import { mongodbConfig } from "../dbConnection/config";
import { utils } from "../utils/server-utils";

export const verifyJWT = (cb) => async (req, res) => {
  try {
    const decodedToken = utils.verifyJWT(req);
    const user = await utils.fetchCurrentUser(decodedToken);
    // const token =
    //   req.cookies?.get("accessToken")?.value ||
    //   req.headers?.authorization?.replace("Bearer ", "");

    // if (!token) throw new Error("Authorization token is missing");

    // const decodedToken = jwt.verify(token, mongodbConfig.accessTokenSecret);

    // const user = await User.findById(decodedToken._id)
    //   .select("_id email fullName avatar")
    //   .lean();

    // if (!user) {
    //   throw new Error("Invalid token or user not found");
    // }

    req.user = user;
    return await cb(req, res);
  } catch (error) {
    return utils.responseHandler({
      message: error.message || "Token verification failed",
      status: 401,
      success: false,
    });
  }
};
