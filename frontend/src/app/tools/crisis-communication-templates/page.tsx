import CrisisCommunicationTemplates from '@/features/crisis/pr/CrisisCommunicationTemplates';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function CrisisCommunicationTemplatesPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="min-h-screen bg-neutral-900">
      <CrisisCommunicationTemplates locale={locale} />
    </div>
  );
}
