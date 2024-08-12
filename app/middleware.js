import { clerkMiddleware } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/signin(.*)", "/signup(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});