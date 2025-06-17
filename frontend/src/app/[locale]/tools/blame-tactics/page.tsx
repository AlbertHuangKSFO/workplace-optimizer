import BlameTactics from '@/features/crisis/tactics/BlameTactics';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function BlameTacticsPage({ params }: PageProps) {
  const { locale } = await params;
  return <BlameTactics />;
}
