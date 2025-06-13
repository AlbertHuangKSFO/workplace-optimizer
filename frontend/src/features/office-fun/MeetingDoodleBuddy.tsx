'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Lightbulb, Loader2, Quote } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const doodleStyles = [
  { value: 'simple', label: '简笔画风格' },
  { value: 'cartoon', label: '卡通风格' },
  { value: 'sketch', label: '素描风格' },
  { value: 'doodle', label: '涂鸦风格' },
  { value: 'minimalist', label: '极简风格' },
];

function MeetingDoodleBuddy(): React.JSX.Element {
  const [keywords, setKeywords] = useState<string>('');
  const [doodleStyle, setDoodleStyle] = useState<string>('doodle');
  const [mode, setMode] = useState<'idea' | 'image'>('idea');
  const [doodleIdea, setDoodleIdea] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setDoodleIdea('');
    setGeneratedImage('');

    if (mode === 'idea') {
      // 生成涂鸦灵感文字描述
      const userMessage = keywords.trim()
        ? `帮我把这些会议关键词变成涂鸦灵感：${keywords}`
        : '会议好无聊，快给我点涂鸦灵感！';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userMessage }],
            toolId: 'meeting-doodle-buddy',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '涂鸦灵感生成失败，可能是我的画笔没墨了。' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.assistantMessage) {
          setDoodleIdea(data.assistantMessage);
        } else {
          console.warn('Unexpected API response structure for doodle idea:', data);
          setError('AI返回的灵感太抽象了，我暂时画不出来...🎨');
        }
      } catch (e) {
        console.error('Failed to fetch doodle idea:', e);
        setError(e instanceof Error ? e.message : '获取涂鸦灵感时发生未知错误，我的缪斯女神休假了！🏖️');
      }
    } else {
      // 生成涂鸦图片
      const selectedStyle = doodleStyles.find(s => s.value === doodleStyle);
      const prompt = keywords.trim()
        ? `${selectedStyle?.label}的会议涂鸦，主题：${keywords}`
        : `${selectedStyle?.label}的会议涂鸦，表现无聊的会议场景`;

      try {
        const response = await fetch('/api/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            style: doodleStyle,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '图片生成失败，可能是AI画师在摸鱼。' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.imageUrl) {
          setGeneratedImage(data.imageUrl);
        } else {
          console.warn('Unexpected API response structure for image generation:', data);
          setError('AI返回的图片格式有点奇怪，我暂时显示不了...🖼️');
        }
      } catch (e) {
        console.error('Failed to generate image:', e);
        setError(e instanceof Error ? e.message : '生成图片时发生未知错误，我的画笔断了！🖌️');
      }
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Quote className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-2 transform scale-x-[-1]" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">"会议神游"涂鸦伴侣</h1>
        <Quote className="w-8 h-8 text-teal-600 dark:text-teal-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              生成模式：
            </Label>
            <Select value={mode} onValueChange={(value: 'idea' | 'image') => setMode(value)}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
              )}>
                <SelectValue placeholder="选择生成模式..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                <SelectItem
                  value="idea"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  💡 涂鸦灵感（文字描述）
                </SelectItem>
                <SelectItem
                  value="image"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  🎨 AI绘制涂鸦（图片）- 仅支持OpenAI
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === 'image' && (
            <div>
              <Label htmlFor="doodleStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                涂鸦风格：
              </Label>
              <Select value={doodleStyle} onValueChange={setDoodleStyle}>
                <SelectTrigger className={cn(
                  "w-full",
                  "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                  "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
                )}>
                  <SelectValue placeholder="选择涂鸦风格..." />
                </SelectTrigger>
                <SelectContent className={cn(
                  "border-neutral-200 dark:border-neutral-700",
                  "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                )}>
                  {doodleStyles.map(style => (
                    <SelectItem
                      key={style.value}
                      value={style.value}
                      className={cn(
                        "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                        "focus:bg-sky-100 dark:focus:bg-sky-700"
                      )}
                    >
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {mode === 'image' && (
          <div className={cn(
            "rounded-lg p-3 text-sm",
            "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-300"
          )}>
            <p className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              图片生成功能仅支持 OpenAI DALL-E 模型，需要配置有效的 OpenAI API Key。
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="keywords" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            听到啥"天书"了？把会议里的"魔性"关键词丢进来！(选填)
          </Label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如：赋能、闭环、颗粒度、对齐一下、抓手..."
            className={cn(
              "w-full min-h-[70px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={2}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {mode === 'idea' ? '灵感火花正在碰撞...' : 'AI画师正在作画...'}
            </>
          ) : (
            <>{mode === 'idea' ? <><Lightbulb className="mr-2 h-4 w-4" /> 给我涂鸦灵感！</> : <><ImageIcon className="mr-2 h-4 w-4" /> AI帮我画涂鸦！</>}
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">灵感枯竭了！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !doodleIdea && !generatedImage && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 dark:text-teal-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {mode === 'idea' ? 'AI涂鸦灵感小助手正在冥想...🧘' : 'AI画师正在挥洒创意...🎨'}
          </p>
        </div>
      )}

      {doodleIdea && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-teal-700 dark:text-teal-400 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" /> 涂鸦灵感：
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doodleIdea}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {generatedImage && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col items-center justify-center shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 p-4"
        )}>
          <CardHeader>
            <CardTitle className="text-teal-700 dark:text-teal-400 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" /> AI创作的涂鸦：
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={generatedImage} alt="AI生成的涂鸦" className="max-w-full max-h-[400px] h-auto rounded-md object-contain" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingDoodleBuddy;
