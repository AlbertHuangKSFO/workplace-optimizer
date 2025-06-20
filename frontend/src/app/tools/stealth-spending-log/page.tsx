import StealthSpendingLog from "@/features/health-wellness/components/StealthSpendingLog";
import { getCurrentLocale } from '@/lib/server-locale';

export default async function StealthSpendingLogPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto py-8">
      <StealthSpendingLog locale={locale} />
    </div>
  );
}
