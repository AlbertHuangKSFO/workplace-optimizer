import ElectronicWoodenFish from '@/features/office-fun/ElectronicWoodenFish';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function ElectronicWoodenFishPage() {
  const locale = await getCurrentLocale();

  return <ElectronicWoodenFish locale={locale} />;
}
