import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { toolCategories } from '@/constants/navigation';
import { getValidLocale, locales, ValidLocale } from '@/lib/i18n';
import { getTranslator } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { Construction, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// 生成静态参数
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = getValidLocale(locale) as ValidLocale;
  const t = await getTranslator(validLocale);

  return (
    <div className={cn(
      "min-h-screen",
      "bg-white dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
    )}>
      {/* Hero Section with Logo */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Image
                src="/logo.png"
                alt="职场优化器 Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('homepage.title')}
            <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-400 dark:text-yellow-400" />
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            {t('homepage.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
              {t('homepage.badges.aiAssistant')}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30">
              {t('homepage.badges.workEfficiency')}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
              {t('homepage.badges.communicationOptimization')}
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30">
              {t('homepage.badges.slackingArtifact')}
            </Badge>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="space-y-12">
          {toolCategories.map((category) => (
            <section key={category.id} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-600 p-3 rounded-xl">
                  <category.icon className="w-6 h-6 text-neutral-700 dark:text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t(`categories.${category.id}`)}</h2>
                  {category.description && (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {t(`categories.${category.id}-description`)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.features.map((feature) => {
                  if (!feature.icon) {
                    console.error(`Error: Icon for feature "${feature.name}" (id: ${feature.id}) is undefined. Please check its definition in navigation.ts.`);
                    // Render a placeholder or skip
                    return (
                      <div key={feature.id} className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900/30">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Icon Loading Error</p>
                        <p className="text-xs text-red-600 dark:text-red-500">Feature: {feature.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Please check console for details.</p>
                      </div>
                    );
                  }
                  return (
                  <Link key={feature.id} href={feature.path} passHref>
                    <Card className={cn(
                      "h-full transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer flex flex-col",
                      "bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-700/50",
                      feature.status === 'wip' ? "opacity-70 hover:opacity-100" : ""
                    )}>
                      <CardHeader className="pb-2 flex-shrink-0">
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-300",
                            "bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-600 dark:to-neutral-500",
                            "group-hover:from-blue-500 group-hover:to-purple-600"
                          )}>
                            <feature.icon className="w-5 h-5 text-neutral-700 dark:text-white" />
                          </div>
                          {feature.status === 'wip' && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-300 flex items-center"
                            >
                              <Construction className="w-3 h-3 mr-1" />
                              {t('common.wip')}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors mt-2">
                          {t(`tools.${feature.id}`) || feature.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <CardDescription className="text-neutral-600 dark:text-neutral-300 text-xs leading-normal">
                          {t(`toolDescriptions.${feature.id}`) || feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {t('homepage.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
