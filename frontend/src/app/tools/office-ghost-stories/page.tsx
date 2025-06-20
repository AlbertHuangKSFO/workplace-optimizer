import OfficeGhostStories from '@/features/office-fun/components/OfficeGhostStories';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function OfficeGhostStoriesPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <OfficeGhostStories locale={locale} />
    </div>
  );
}
