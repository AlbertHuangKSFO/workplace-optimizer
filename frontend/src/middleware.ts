import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getLocaleFromPath, locales } from './lib/i18n';

// 检测用户首选语言
function detectLocale(request: NextRequest): string {
  // 首先检查URL中是否有语言参数
  const localeFromPath = getLocaleFromPath(request.nextUrl.pathname);
  if (localeFromPath) {
    return localeFromPath;
  }

  // 检查cookie中的语言设置
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 检查Accept-Language头
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // 简单的语言匹配
    for (const locale of locales) {
      if (acceptLanguage.includes(locale.split('-')[0])) {
        return locale;
      }
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 跳过API路由和静态文件
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 检查路径中是否已经包含语言前缀
  const localeFromPath = getLocaleFromPath(pathname);

  if (localeFromPath) {
    // 如果是默认语言，重定向到无前缀的路径
    if (localeFromPath === defaultLocale) {
      const newPath = pathname.replace(`/${localeFromPath}`, '') || '/';
      const response = NextResponse.redirect(new URL(newPath, request.url));
      response.cookies.set('locale', localeFromPath, { maxAge: 365 * 24 * 60 * 60 });
      return response;
    }

    // 设置语言cookie
    const response = NextResponse.next();
    response.cookies.set('locale', localeFromPath, { maxAge: 365 * 24 * 60 * 60 });
    return response;
  }

  // 检测用户首选语言
  const detectedLocale = detectLocale(request);

  // 如果不是默认语言，重定向到带语言前缀的路径
  if (detectedLocale !== defaultLocale) {
    const newPath = `/${detectedLocale}${pathname}`;
    const response = NextResponse.redirect(new URL(newPath, request.url));
    response.cookies.set('locale', detectedLocale, { maxAge: 365 * 24 * 60 * 60 });
    return response;
  }

  // 默认语言，设置cookie
  const response = NextResponse.next();
  response.cookies.set('locale', defaultLocale, { maxAge: 365 * 24 * 60 * 60 });
  return response;
}

export const config = {
  matcher: [
    // 匹配所有路径，除了API路由和静态文件
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
