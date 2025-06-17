'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addLocaleToPath, defaultLocale, getLocaleFromPath, languageConfig, locales, removeLocaleFromPath, ValidLocale } from '@/lib/i18n';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LanguageSwitcher() {
  const router = useRouter();
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
        .find(row => row.startsWith('locale='))
        ?.split('=')[1];
      if (cookieLocale && locales.includes(cookieLocale as ValidLocale)) {
        setCurrentLocale(cookieLocale as ValidLocale);
      }
    }
  }, [pathname]);

  const handleLanguageChange = (newLocale: ValidLocale) => {
    if (newLocale === currentLocale) return;

    // 获取当前路径（不包含语言前缀）
    const currentPath = removeLocaleFromPath(pathname, currentLocale);

    // 构建新的路径
    const newPath = addLocaleToPath(currentPath, newLocale);

    // 设置cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;

    // 导航到新路径
    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-2">
      <Languages className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      <Select
        value={currentLocale}
        onValueChange={(value) => handleLanguageChange(value as ValidLocale)}
      >
        <SelectTrigger className="w-32 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              <span className="flex items-center space-x-2">
                <span>{languageConfig[locale].flag}</span>
                <span>{languageConfig[locale].name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
