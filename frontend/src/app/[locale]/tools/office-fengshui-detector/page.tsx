import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: {
    locale: ValidLocale;
  };
}

export default function Page({ params }: PageProps) {
  // 动态导入原始页面组件
  const OriginalPage = require('@/app/tools/office-fengshui-detector/page').default;
  return <OriginalPage />;
}
