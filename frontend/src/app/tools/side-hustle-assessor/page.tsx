import SideHustleAssessor from '@/features/workplace-survival/SideHustleAssessor';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function SideHustleAssessorPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <SideHustleAssessor locale={locale} />
    </div>
  );
}
