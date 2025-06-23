import { NextResponse } from "next/server";

const asyncHandler = (requestHandler) => async (req, res) => {
  try {
    return await requestHandler(req, res);
  } catch (error) {
    console.error("Error in asyncHandler:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      {
        status: error.status || 500,
      }
    );
  }
};

export { asyncHandler };
