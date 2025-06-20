import ResignationTemplates from '@/features/crisis/resignation/ResignationTemplates';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function ResignationTemplatesPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="min-h-screen bg-neutral-900">
      <ResignationTemplates locale={locale} />
    </div>
  );
}
