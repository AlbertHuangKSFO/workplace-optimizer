import ParallelUniverseWorkSimulator from "@/features/office-fun/components/ParallelUniverseWorkSimulator";
import { getCurrentLocale } from '@/lib/server-locale';

export default async function ParallelUniverseWorkSimulatorPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto py-10">
      <ParallelUniverseWorkSimulator locale={locale} />
    </div>
  );
}
