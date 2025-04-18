import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 로그인 페이지에 이미 로그인한 사용자가 접근하면 홈으로 리디렉션
  if (session && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // 로그인이 필요한 페이지에 로그인하지 않은 사용자가 접근하면 로그인 페이지로 리디렉션
  const protectedRoutes: string[] = [] // 모든 경로를 공개로 설정
  if (!session && protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
