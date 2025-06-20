import WorkTimeMachine from '@/features/office-fun/components/WorkTimeMachine';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function WorkTimeMachinePage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <WorkTimeMachine locale={locale} />
    </div>
  );
}
