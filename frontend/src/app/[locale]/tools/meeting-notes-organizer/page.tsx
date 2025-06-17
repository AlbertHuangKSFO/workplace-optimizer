import MeetingNotesOrganizer from '@/features/analysis/meeting-notes/MeetingNotesOrganizer';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <MeetingNotesOrganizer locale={locale} />;
}
