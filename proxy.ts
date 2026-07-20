import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoutes = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoutes && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});
