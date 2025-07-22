import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Daftar halaman yang butuh login
const protectedRoutes = ['/dashboard']

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })

  const { pathname } = req.nextUrl

  // Cek kalau user akses route yang butuh login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Redirect ke login kalau belum login
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'], // Proteksi semua URL di /dashboard
}
