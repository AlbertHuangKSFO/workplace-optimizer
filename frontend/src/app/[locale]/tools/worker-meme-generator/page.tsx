import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  // 动态导入原始页面组件
  const OriginalPage = require('@/app/tools/worker-meme-generator/page').default;
  return <OriginalPage />;
}
