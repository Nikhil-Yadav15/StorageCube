export const apiUrls = {
  baseUrl: process.env.NEXT_PUBLIC_DEVELOPMENT_API_BASE_URL!,
  signup: "/user/sign-up",
  signin: "/user/sign-in",
  verifyEmail: "/user/verify-email",
  resend: "/user/resend",
  profile: "/user/profile",
  logout: "/user/logout",
  refreshAccessToken: "/user/refresh-token",
  uploadFile: "/file/upload",
  getFile: "/file",
  getTotalSpaceUsed: "/file/total-space",
};
