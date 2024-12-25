import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 管理画面へのアクセスをチェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // auth-tokenの存在を確認
    const authToken = request.cookies.get('auth-token');
    
    if (!authToken || authToken.value !== 'dummy-token') {
      // ログインページにリダイレクト
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ['/admin/:path*']
}; 