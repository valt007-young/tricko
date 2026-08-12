import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/forest", "/plant", "/missions", "/mymissions", "/work", "/admin", "/account"];
const AUTH_PAGES = ["/login", "/signup"];

function matches(pathname: string, list: string[]) {
  return list.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session token if needed — fails silently when logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const session = Boolean(user);

  if (matches(pathname, AUTH_PAGES) && session) {
    return NextResponse.redirect(new URL("/forest", request.url));
  }
  if (matches(pathname, PROTECTED) && !session) {
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
  }
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};