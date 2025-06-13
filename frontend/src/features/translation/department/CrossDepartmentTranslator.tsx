'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowRight, Building2, Loader2, Users } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const departments = [
  { value: 'tech', label: '技术部门', emoji: '💻' },
  { value: 'product', label: '产品部门', emoji: '📱' },
  { value: 'design', label: '设计部门', emoji: '🎨' },
  { value: 'marketing', label: '市场部门', emoji: '📢' },
  { value: 'sales', label: '销售部门', emoji: '💰' },
  { value: 'operations', label: '运营部门', emoji: '⚙️' },
  { value: 'hr', label: '人力资源', emoji: '👥' },
  { value: 'finance', label: '财务部门', emoji: '💼' },
  { value: 'legal', label: '法务部门', emoji: '⚖️' },
  { value: 'management', label: '管理层', emoji: '👔' },
];

function CrossDepartmentTranslator(): React.JSX.Element {
  const [originalText, setOriginalText] = useState<string>('');
  const [sourceDepartment, setSourceDepartment] = useState<string>('tech');
  const [targetDepartment, setTargetDepartment] = useState<string>('product');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!originalText.trim()) {
      setError('请输入需要翻译的内容！');
      setTranslatedText('');
      return;
    }

    if (sourceDepartment === targetDepartment) {
      setError('源部门和目标部门不能相同！');
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    const sourceDept = departments.find(d => d.value === sourceDepartment);
    const targetDept = departments.find(d => d.value === targetDepartment);

    const userPrompt = `请帮我将以下来自${sourceDept?.label}的信息翻译成${targetDept?.label}能够理解和认同的表达方式：\n\n${originalText}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'cross-department-translator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '翻译失败，可能是翻译官在摸鱼。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setTranslatedText(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的翻译结果格式有误，翻译官可能在开小差...🤖');
      }
    } catch (e) {
      console.error('Failed to translate:', e);
      setError(e instanceof Error ? e.message : '翻译时发生未知错误，部门间的沟通壁垒太厚了！🧱');
    }

    setIsLoading(false);
  }

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <Building2 className="w-8 h-8 text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">跨部门沟通翻译</h1>
        <Users className="w-8 h-8 text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="sourceDepartment" className="block text-sm font-medium text-neutral-300 mb-2">
              源部门：
            </Label>
            <Select value={sourceDepartment} onValueChange={setSourceDepartment}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择源部门..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    {dept.emoji} {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <Label htmlFor="targetDepartment" className="block text-sm font-medium text-neutral-300 mb-2">
              目标部门：
            </Label>
            <Select value={targetDepartment} onValueChange={setTargetDepartment}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择目标部门..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    {dept.emoji} {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="originalText" className="block text-sm font-medium text-neutral-300 mb-2">
            输入需要翻译的内容：
          </Label>
          <Textarea
            id="originalText"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="例如：我们需要重构整个架构，优化性能瓶颈，提升系统稳定性..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[120px]"
            rows={5}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 翻译官正在努力破译部门黑话...</>
          ) : (
            <><Users className="mr-2 h-4 w-4" /> 开始跨部门翻译！</>
          )}
        </Button>
      </form>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">翻译失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !translatedText && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
          <p className="text-neutral-400">AI翻译官正在学习各部门的"方言"，请稍候...🌐</p>
        </div>
      )}

      {translatedText && !isLoading && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Users className="w-5 h-5 mr-2" /> 跨部门翻译结果
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CrossDepartmentTranslator;
