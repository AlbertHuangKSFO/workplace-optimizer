import WorkerMemeGeneratorPro from '@/features/content-creation/components/WorkerMemeGeneratorPro';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function WorkerMemeGeneratorProPage() {
  const locale = await getCurrentLocale();

  return <WorkerMemeGeneratorPro locale={locale} />;
}

export const metadata = {
  title: '打工人表情包生成器 Pro - 职场优化器',
  description: '专业定制打工人专属表情包，让你的吐槽更有艺术感',
};
