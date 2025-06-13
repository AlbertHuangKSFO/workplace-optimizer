'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toolCategories } from '@/constants/tools';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            职场优化器
            <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-400" />
          </h1>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            AI驱动的职场工具集合，让工作更高效、沟通更顺畅、摸鱼更有艺术感
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              AI智能助手
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              职场效率
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              沟通优化
            </Badge>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              摸鱼神器
            </Badge>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="space-y-12">
          {toolCategories.map((category) => (
            <section key={category.key} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-neutral-700 to-neutral-600 p-3 rounded-xl">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.label}</h2>
                  <p className="text-neutral-400">
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
                    <Card className="h-full bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="bg-gradient-to-r from-neutral-600 to-neutral-500 p-2 rounded-lg group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                            <tool.icon className="w-5 h-5 text-white" />
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              category.key === 'communication' ? 'border-blue-500/50 text-blue-300' :
                              category.key === 'translation' ? 'border-green-500/50 text-green-300' :
                              category.key === 'generation' ? 'border-purple-500/50 text-purple-300' :
                              category.key === 'crisis' ? 'border-red-500/50 text-red-300' :
                              category.key === 'analysis' ? 'border-cyan-500/50 text-cyan-300' :
                              'border-orange-500/50 text-orange-300'
                            }`}
                          >
                            {category.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                          {tool.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-neutral-300 text-sm leading-relaxed">
                          {tool.description}
                        </CardDescription>
                        {tool.tags && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {tool.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-neutral-700/50 text-neutral-400 border-neutral-600"
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
        <div className="text-center mt-16 pt-8 border-t border-neutral-700">
          <p className="text-neutral-400 text-sm">
            🚀 让AI成为你的职场助手，工作效率翻倍，摸鱼技能满级！
          </p>
        </div>
      </div>
    </div>
  );
}
