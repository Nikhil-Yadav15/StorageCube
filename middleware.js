import { NextResponse } from "next/server";

const publicRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");
  const isPublicRoute = publicRoutes.includes(pathname);

  if (accessToken?.value) {
    return isPublicRoute
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  } else {
    return isPublicRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/profile",
    "/",
    "/:type(images|documents|media|others)*",
  ],
};
