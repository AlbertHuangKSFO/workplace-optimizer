import { cookies } from 'next/headers';
import { defaultLocale, getValidLocale, ValidLocale } from './i18n';

export async function getCurrentLocale(): Promise<ValidLocale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value;

  if (locale) {
    return getValidLocale(locale);
  }

  return defaultLocale;
}
