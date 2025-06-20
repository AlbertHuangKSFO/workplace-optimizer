import MeetingNotesOrganizer from '@/features/analysis/meeting-notes/MeetingNotesOrganizer';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function MeetingNotesOrganizerPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="min-h-screen bg-neutral-900">
      <MeetingNotesOrganizer locale={locale} />
    </div>
  );
}
