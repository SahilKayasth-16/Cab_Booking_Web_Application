import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isRiderRoute = createRouteMatcher(["/rider(.*)"]);
const isDriverRoute = createRouteMatcher(["/driver(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 1. Not signed in: only public routes allowed
  if (!userId) {
    if (isPublicRoute(req)) return NextResponse.next();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const role = sessionClaims?.metadata?.role;

  // 2. Signed in, no role yet: force onboarding
  if (!role) {
    if (isOnboardingRoute(req) || isPublicRoute(req)) return NextResponse.next();
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 3. Has a role: skip onboarding
  if (isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  // 4. Role-based protection
  if (isRiderRoute(req) && role !== "rider") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }
  if (isDriverRoute(req) && role !== "driver") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};