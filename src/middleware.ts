import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Check for the jwt cookie
  const jwt = req.cookies.get("jwt");
  console.log("JWT cookie:", jwt);

  // Redirect to home if trying to access protected route without auth
  if (isProtectedRoute && !jwt) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Redirect to dashboard if trying to access public route while authenticated
  if (isPublicRoute && jwt && !req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
