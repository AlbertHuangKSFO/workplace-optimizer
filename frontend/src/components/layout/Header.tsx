'use client';

import { Github, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ModelSelector } from './ModelSelector';

// Placeholder for ModelSelector, to be created later as per docs
// import ModelSelector from './ModelSelector';

export function Header() {
  const githubUrl = 'https://github.com/AlbertHuangKSFO/workplace-optimizer';
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const pathname = usePathname();

  console.log('[Header] Current selectedModelId state:', selectedModelId);

  const handleModelSelect = useCallback((modelId: string) => {
    console.log('[Header] handleModelSelect called with:', modelId);
    setSelectedModelId(modelId);
  }, []);

  const handleModelInitialized = useCallback((defaultModelId: string) => {
    console.log('[Header] handleModelInitialized called with:', defaultModelId);
    setSelectedModelId(defaultModelId);
  }, []);

  // 根据路径显示当前页面标题
  const getPageTitle = () => {
    if (pathname === '/') return '打工人必备工具 - 首页';
    if (pathname.includes('/tools/')) {
      const toolName = pathname.split('/tools/')[1];
      const toolTitleMap: { [key: string]: string } = {
        'speech-optimizer': '话术优化器',
        'email-polisher': '邮件润色器',
        'meeting-speech-generator': '会议发言生成器',
        'jargon-translator': '黑话翻译器',
        'cross-department-translator': '跨部门沟通翻译',
        'eq-assistant': '职场情商助手',
        'ppt-phrase-generator': 'PPT金句生成器',
        'professional-persona-generator': '职场人设生成器',
        'data-beautifier': '汇报数据美化器',
        'blame-tactics': '甩锅/背锅话术',
        'crisis-communication-templates': '危机公关模板',
        'resignation-templates': '离职/跳槽文案',
        'team-mood-detector': '团队氛围检测器',
        'meeting-notes-organizer': '会议记录智能整理',
        'workplace-meme-generator': '职场梗图生成器',
      };
      return `当前工具: ${toolTitleMap[toolName] || '未知工具'}`;
    }
    return '打工人必备工具';
  };

  return (
    <header className="h-14 flex items-center justify-between bg-neutral-800 px-6 border-b border-neutral-700 flex-shrink-0">
      <div>
        <h1 className="text-md font-medium text-neutral-200">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ModelSelector
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          onModelInitialized={handleModelInitialized}
        />
        <Link
          href="/"
          title="返回首页"
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          <Home size={20} />
        </Link>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          <Github size={20} />
        </a>
        <button
          title="User Profile"
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
