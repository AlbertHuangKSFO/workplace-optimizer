import EmailPolisher from '@/features/communication/email/EmailPolisher';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function EmailPolisherPage() {
  const locale = await getCurrentLocale();

  return <EmailPolisher locale={locale} />;
}
