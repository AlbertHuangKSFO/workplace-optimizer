'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { toolCategories } from '@/constants/tools';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
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
            打工人必备工具箱
            <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-400 dark:text-yellow-400" />
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            AI驱动的职场工具集合，让工作更高效、沟通更顺畅、摸鱼更有艺术感
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
              AI智能助手
            </Badge>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30">
              职场效率
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
              沟通优化
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30">
              摸鱼神器
            </Badge>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="space-y-12">
          {toolCategories.map((category) => (
            <section key={category.key} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-600 p-3 rounded-xl">
                  <category.icon className="w-6 h-6 text-neutral-700 dark:text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{category.label}</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    {category.key === 'communication' && '提升沟通效率，让表达更专业'}
                    {category.key === 'translation' && '消除沟通壁垒，促进跨部门协作'}
                    {category.key === 'generation' && '智能生成内容，提升工作效率'}
                    {category.key === 'crisis' && '应对职场危机，化解沟通难题'}
                    {category.key === 'analysis' && '智能分析工具，洞察职场动态'}
                    {category.key === 'office-fun' && '工作之余的乐趣，摸鱼也要有品质'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => (
                  <Link key={tool.id} href={tool.href}>
                    <Card className={cn(
                      "h-full transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer",
                      "bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-300",
                            "bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-600 dark:to-neutral-500",
                            "group-hover:from-blue-500 group-hover:to-purple-600"
                          )}>
                            <tool.icon className="w-5 h-5 text-neutral-700 dark:text-white" />
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              category.key === 'communication' ? 'border-blue-300 dark:border-blue-500/50 text-blue-600 dark:text-blue-300' :
                              category.key === 'translation' ? 'border-green-300 dark:border-green-500/50 text-green-600 dark:text-green-300' :
                              category.key === 'generation' ? 'border-purple-300 dark:border-purple-500/50 text-purple-600 dark:text-purple-300' :
                              category.key === 'crisis' ? 'border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-300' :
                              category.key === 'analysis' ? 'border-cyan-300 dark:border-cyan-500/50 text-cyan-600 dark:text-cyan-300' :
                              'border-orange-300 dark:border-orange-500/50 text-orange-600 dark:text-orange-300'
                            )}
                          >
                            {category.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-neutral-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                          {tool.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                          {tool.description}
                        </CardDescription>
                        {tool.tags && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {tool.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-neutral-100 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-600"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            🚀 让AI成为你的职场助手，工作效率翻倍，摸鱼技能满级！
          </p>
        </div>
      </div>
    </div>
  );
}
