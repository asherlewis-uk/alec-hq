import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWorkspaceSessionToken } from "@/lib/server/auth/token";

const publicPagePrefixes = ["/login", "/share", "/catalog"];
const publicApiPrefixes = [
  "/api/auth/workspace/login",
  "/api/auth/session",
  "/api/public",
  "/api/catalog",
];

function isPublicPage(pathname: string) {
  return publicPagePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPublicApi(pathname: string) {
  return publicApiPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const wsToken = request.cookies.get("alec_workspace_session")?.value ?? null;
  const wsSession = await verifyWorkspaceSessionToken(wsToken);
  return Boolean(wsSession);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await hasValidSession(request);

  if (pathname.startsWith("/api")) {
    if (isPublicApi(pathname)) return NextResponse.next();
    if (!authenticated) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in.",
          },
        },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\..*).*)",
    "/api/:path*",
  ],
};
