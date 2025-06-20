'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { defaultLocale, getLocaleFromPath, locales, ValidLocale } from './i18n';

export function useLocale(): ValidLocale {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<ValidLocale>(defaultLocale);

  useEffect(() => {
    // 从路径中获取当前语言
    const localeFromPath = getLocaleFromPath(pathname);
    if (localeFromPath) {
      setCurrentLocale(localeFromPath);
    } else {
      // 检查cookie中的语言设置
      const cookieLocale = document.cookie
        .split('; ')
        .find((row) => row.startsWith('locale='))
        ?.split('=')[1];
      if (cookieLocale && locales.includes(cookieLocale as ValidLocale)) {
        setCurrentLocale(cookieLocale as ValidLocale);
      }
    }
  }, [pathname]);

  return currentLocale;
}
