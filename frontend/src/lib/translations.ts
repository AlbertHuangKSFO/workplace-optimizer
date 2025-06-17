import { ValidLocale } from './i18n';

// 翻译数据类型
type TranslationData = Record<string, any>;

// 动态导入翻译文件
const translations: Record<ValidLocale, () => Promise<TranslationData>> = {
  'zh-CN': () => import('../locales/zh-CN.json').then((module) => module.default),
  'en-US': () => import('../locales/en-US.json').then((module) => module.default),
};

// 获取翻译数据
export async function getTranslations(locale: ValidLocale): Promise<TranslationData> {
  try {
    return await translations[locale]();
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // 回退到默认语言
    return await translations['zh-CN']();
  }
}

// 获取翻译函数
export async function getTranslator(locale: ValidLocale) {
  const data = await getTranslations(locale);

  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let result: any = data;

    // 遍历键路径
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key} for locale: ${locale}`);
        return key; // 返回键名作为回退
      }
    }

    if (typeof result !== 'string') {
      console.warn(`Translation value is not a string: ${key} for locale: ${locale}`);
      return key;
    }

    // 处理参数替换
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramValue));
      }, result);
    }

    return result;
  };
}
