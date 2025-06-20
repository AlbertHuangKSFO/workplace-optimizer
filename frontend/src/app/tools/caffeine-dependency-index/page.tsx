import CaffeineDependencyIndex from '@/features/health-wellness/components/CaffeineDependencyIndex';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function CaffeineDependencyIndexPage() {
  const locale = await getCurrentLocale();

  return <CaffeineDependencyIndex locale={locale} />;
}

export const metadata = {
  title: '咖啡因依赖指数 - 职场优化器',
  description: '计算您的每日咖啡因摄入量和依赖程度，获得专业的健康建议',
};
