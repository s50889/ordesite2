import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Start:', request.nextUrl.pathname);
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          console.log('[Middleware] cookies.getAll called');
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log('[Middleware] cookies.setAll called with:', cookiesToSet);
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 認証状態を確認
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log('[Middleware] User from supabase.auth.getUser():', user ? user.email : 'No user');

  // 保護されたルートの定義
  const protectedRoutes = ['/dashboard', '/cart', '/order-confirm', '/orders', '/admin', '/sales']
  const authRoutes = ['/login', '/signup']
  const pathname = request.nextUrl.pathname

  // 認証が必要なルートで未認証の場合
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !user) {
    console.log('[Middleware] Redirecting to /login (protected route, no user)');
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーが認証ページにアクセスした場合
  if (authRoutes.includes(pathname) && user) {
    console.log('[Middleware] User exists and accessing auth route, checking role...');
    console.log('[Middleware] User ID:', user.id);
    console.log('[Middleware] User Email:', user.email);
    
    // すべてのユーザーをホームページにリダイレクト
    console.log('[Middleware] Redirecting authenticated user to home page');
    const url = request.nextUrl.clone()
    url.pathname = '/'
    
    return NextResponse.redirect(url)
  }

  // ロールベースのアクセス制御
  if (user) {
    console.log('[Middleware] User exists, checking role...');
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      console.error('[Middleware] Error fetching user profile:', userError);
    }
    console.log('[Middleware] User profile data:', userData);

    if (userData) {
      const role = userData.role
      console.log('[Middleware] User role:', role);
      
      // 管理者ページへのアクセス制限
      if (pathname.startsWith('/admin') && role !== 'admin') {
        console.log('[Middleware] Redirecting to /dashboard (admin route, wrong role)');
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // 営業ページへのアクセス制限
      if (pathname.startsWith('/sales') && !['sales', 'admin'].includes(role)) {
        console.log('[Middleware] Redirecting to /dashboard (sales route, wrong role)');
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }
  console.log('[Middleware] End:', request.nextUrl.pathname);
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}