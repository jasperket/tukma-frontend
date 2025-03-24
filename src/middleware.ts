import { type NextRequest, NextResponse } from "next/server";
import { getUserType } from "./lib/session";

const protectedRoutes = ["/applicant", "/recruiter"];
const publicRoutes = ["/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Check for the jwt cookie
  const jwt = req.cookies.get("jwt");
  // console.log("JWT cookie:", jwt);

  // Redirect to home if trying to access protected route without auth
  if (isProtectedRoute && !jwt) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // If the user is authenticated, get their role
  if (jwt) {
    const userType = await getUserType();

    // Redirect to the appropriate dashboard if trying to access a public route while authenticated
    if (isPublicRoute) {
      if (userType === "applicant") {
        return NextResponse.redirect(
          new URL("/applicant", req.nextUrl),
        );
      } else if (userType === "recruiter") {
        return NextResponse.redirect(
          new URL("/recruiter", req.nextUrl),
        );
      }
    }

    // Protect nested routes based on user type
    if (userType === "applicant" && !path.startsWith("/applicant")) {
      return NextResponse.rewrite(new URL("/404", req.nextUrl));
    } else if (userType === "recruiter" && !path.startsWith("/recruiter")) {
      return NextResponse.rewrite(new URL("/404", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
