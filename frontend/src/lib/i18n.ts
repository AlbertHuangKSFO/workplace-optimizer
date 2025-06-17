export const defaultLocale = 'zh-CN';
export const locales = ['zh-CN', 'en-US'] as const;
export type ValidLocale = (typeof locales)[number];

// 语言配置
export const languageConfig = {
  'zh-CN': {
    name: '中文',
    flag: '🇨🇳',
  },
  'en-US': {
    name: 'English',
    flag: '🇺🇸',
  },
};

// 获取有效的语言
export function getValidLocale(locale: string): ValidLocale {
  return locales.includes(locale as ValidLocale) ? (locale as ValidLocale) : defaultLocale;
}

// 从路径中提取语言
export function getLocaleFromPath(pathname: string): ValidLocale | null {
  const segments = pathname.split('/');
  const firstSegment = segments[1];

  if (firstSegment && locales.includes(firstSegment as ValidLocale)) {
    return firstSegment as ValidLocale;
  }

  return null;
}

// 移除路径中的语言前缀
export function removeLocaleFromPath(pathname: string, locale: ValidLocale): string {
  if (pathname.startsWith(`/${locale}`)) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

// 添加语言前缀到路径
export function addLocaleToPath(pathname: string, locale: ValidLocale): string {
  if (locale === defaultLocale) {
    return pathname;
  }
  return `/${locale}${pathname}`;
}
