import { redirect } from 'next/navigation';

export default function BlameGameMasterPage() {
  // Redirect to the actual blame-tactics page
  redirect('/tools/blame-tactics');
}
