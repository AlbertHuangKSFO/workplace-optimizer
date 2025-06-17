import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: {
    locale: ValidLocale;
  };
}

export default function Page({ params }: PageProps) {
  // 动态导入原始页面组件
  const OriginalPage = require('@/app/tools/crisis-communication-templates/page').default;
  return <OriginalPage />;
}
