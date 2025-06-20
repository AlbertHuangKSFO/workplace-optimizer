import WorkplaceMemeGenerator from '@/features/analysis/meme-generator/WorkplaceMemeGenerator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function WorkplaceMemeGeneratorPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="min-h-screen bg-neutral-900">
      <WorkplaceMemeGenerator locale={locale} />
    </div>
  );
}
