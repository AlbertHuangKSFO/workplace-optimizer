'use client';

import { useCallback, useEffect, useState } from 'react';
import { ValidLocale } from './i18n';

// 预加载翻译数据
const translationCache: Record<ValidLocale, Record<string, any> | null> = {
  'zh-CN': null,
  'en-US': null,
};

// Helper function to get nested object values
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to interpolate parameters
function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] || match;
  });
}

// 加载翻译数据的函数
async function loadTranslationData(locale: ValidLocale): Promise<Record<string, any>> {
  if (translationCache[locale]) {
    return translationCache[locale]!;
  }

  try {
    let data: Record<string, any>;

    // 使用require而不是动态import来避免JSON导入问题
    if (typeof window === 'undefined') {
      // 服务器端
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'src', 'locales', `${locale}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(fileContent);
    } else {
      // 客户端 - 使用fetch
      console.log(`Loading translations for ${locale}...`);
      const response = await fetch(`/locales/${locale}.json`);
      console.log(`Fetch response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${locale}.json: ${response.status}`);
      }
      data = await response.json();
      console.log(`Loaded ${Object.keys(data).length} translation keys for ${locale}`);
    }

    translationCache[locale] = data;
    return data;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);

    // 如果加载失败，尝试使用默认语言
    if (locale !== 'zh-CN') {
      console.warn(`Falling back to zh-CN for locale ${locale}`);
      return loadTranslationData('zh-CN');
    }

    // 如果连默认语言都加载失败，返回空对象
    return {};
  }
}

// Client-side translation hook
export function useTranslations(locale: ValidLocale) {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTranslations = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await loadTranslationData(locale);

        if (isMounted) {
          setTranslations(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Failed to load translations for ${locale}:`, error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string> | { returnObjects?: boolean }) => {
      if (loading) {
        return key; // 加载中时返回key，但组件应该处理加载状态
      }

      if (error) {
        console.warn(`Translation error for locale ${locale}:`, error);
        return key;
      }

      // 处理 returnObjects 参数
      const isReturnObjects =
        params && typeof params === 'object' && 'returnObjects' in params && params.returnObjects;
      const interpolationParams = isReturnObjects ? {} : (params as Record<string, string>) || {};

      const value = getNestedValue(translations, key);

      if (value !== undefined) {
        if (typeof value === 'string') {
          return interpolationParams && Object.keys(interpolationParams).length > 0
            ? interpolate(value, interpolationParams)
            : value;
        } else if (isReturnObjects) {
          return value; // 返回对象或数组
        }
      }

      // 如果找不到翻译，记录警告并返回key
      console.warn(`Translation key not found: ${key} for locale ${locale}`);
      return key;
    },
    [translations, loading, error, locale]
  );

  return { t, loading, error, translations };
}
