'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { Loader2, Presentation, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const presentationStyles = [
  { value: 'inspiring', label: '激励人心', emoji: '🔥', description: '充满激情，鼓舞士气' },
  { value: 'analytical', label: '理性分析', emoji: '📊', description: '数据驱动，逻辑清晰' },
  { value: 'humorous', label: '幽默诙谐', emoji: '😄', description: '轻松有趣，寓教于乐' },
  { value: 'professional', label: '专业严谨', emoji: '💼', description: '正式专业，权威可信' },
  { value: 'innovative', label: '创新前瞻', emoji: '🚀', description: '前沿思维，引领潮流' },
  { value: 'storytelling', label: '故事叙述', emoji: '📖', description: '情节生动，引人入胜' },
];

const phraseTypes = [
  { value: 'title', label: '标题金句', description: '适合作为章节标题或重点强调' },
  { value: 'opening', label: '开场白', description: '演示开头，抓住注意力' },
  { value: 'transition', label: '过渡语', description: '连接不同部分，承上启下' },
  { value: 'conclusion', label: '总结语', description: '结尾升华，留下深刻印象' },
  { value: 'highlight', label: '亮点句', description: '突出重点，画龙点睛' },
];

function PPTPhraseGenerator(): React.JSX.Element {
  const [topic, setTopic] = useState<string>('');
  const [coreMessage, setCoreMessage] = useState<string>('');
  const [presentationStyle, setPresentationStyle] = useState<string>('professional');
  const [phraseType, setPhraseType] = useState<string>('title');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [generatedPhrases, setGeneratedPhrases] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic.trim()) {
      setError('请输入PPT主题！');
      setGeneratedPhrases('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPhrases('');

    const selectedStyle = presentationStyles.find(s => s.value === presentationStyle);
    const selectedType = phraseTypes.find(t => t.value === phraseType);

    const userPrompt = `
PPT主题：${topic}
${coreMessage.trim() ? `核心观点：${coreMessage}` : ''}
演示风格：${selectedStyle?.label} - ${selectedStyle?.description}
金句类型：${selectedType?.label} - ${selectedType?.description}
${targetAudience.trim() ? `目标听众：${targetAudience}` : ''}

请为我的PPT生成多个精彩的金句，要求言简意赅、富有冲击力、易于记忆。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'ppt-phrase-generator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '金句生成失败，可能是文案大师在思考更好的表达。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedPhrases(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的金句格式有误，文案大师可能在酝酿更好的创意...✨');
      }
    } catch (e) {
      console.error('Failed to generate phrases:', e);
      setError(e instanceof Error ? e.message : '生成金句时发生未知错误，灵感可能暂时枯竭了！💡');
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Presentation className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">PPT金句生成器</h1>
        <Zap className="w-8 h-8 text-yellow-500 dark:text-yellow-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="topic" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            PPT主题：
          </Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：数字化转型战略、产品创新方案、团队管理心得..."
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
          />
        </div>
        <div>
          <Label htmlFor="coreMessage" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            核心观点（选填）：
          </Label>
          <Textarea
            id="coreMessage"
            value={coreMessage}
            onChange={(e) => setCoreMessage(e.target.value)}
            placeholder="例如：通过数据驱动决策，提升用户体验，实现业务增长..."
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="presentationStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              演示风格：
            </Label>
            <Select value={presentationStyle} onValueChange={setPresentationStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder="选择演示风格..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {presentationStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {style.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phraseType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              金句类型：
            </Label>
            <Select value={phraseType} onValueChange={setPhraseType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder="选择金句类型..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {phraseTypes.map(type => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            目标听众（选填）：
          </Label>
          <Input
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="例如：技术团队、管理层、客户、投资人..."
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-yellow-500 hover:bg-yellow-600 text-neutral-900 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-neutral-900",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 文案大师正在创作金句...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 生成PPT金句！</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">创作失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedPhrases && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 dark:text-yellow-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">PPT金句打磨中，请稍候...✨</p>
        </div>
      )}

      {generatedPhrases && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> 金句来袭，请查收！
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedPhrases}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PPTPhraseGenerator;
