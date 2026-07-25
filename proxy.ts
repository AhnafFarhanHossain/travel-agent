import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  const isProtectedRoutes = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/create-trip");

  if (isProtectedRoutes && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});
