'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2, Smile, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const memeCategories = [
  { value: 'meeting-humor', label: '会议搞笑', emoji: '😂', description: '会议中的各种搞笑瞬间' },
  { value: 'deadline-stress', label: '截止日期焦虑', emoji: '😰', description: 'DDL临近的紧张心情' },
  { value: 'boss-interaction', label: '老板互动', emoji: '👔', description: '与领导相处的趣事' },
  { value: 'overtime-life', label: '加班生活', emoji: '🌙', description: '加班狗的日常写照' },
  { value: 'code-debugging', label: '代码调试', emoji: '🐛', description: '程序员的调试日常' },
  { value: 'office-politics', label: '办公室政治', emoji: '🎭', description: '职场人际关系' },
  { value: 'work-from-home', label: '居家办公', emoji: '🏠', description: '远程工作的酸甜苦辣' },
  { value: 'salary-dreams', label: '薪资梦想', emoji: '💰', description: '关于涨薪的美好幻想' },
];

const memeStyles = [
  { value: 'classic-template', label: '经典模板', emoji: '🖼️', description: '使用经典梗图模板' },
  { value: 'text-based', label: '文字梗', emoji: '📝', description: '纯文字的搞笑内容' },
  { value: 'dialogue', label: '对话形式', emoji: '💬', description: '人物对话的形式' },
  { value: 'comparison', label: '对比梗', emoji: '⚖️', description: '理想vs现实的对比' },
  { value: 'progression', label: '递进式', emoji: '📈', description: '情况逐步恶化/好转' },
  { value: 'reaction', label: '反应梗', emoji: '😱', description: '各种情况下的反应' },
];

const humorLevels = [
  { value: 'mild', label: '温和幽默', emoji: '😊', description: '轻松愉快，适合分享' },
  { value: 'sarcastic', label: '讽刺幽默', emoji: '😏', description: '带有讽刺意味的幽默' },
  { value: 'self-deprecating', label: '自嘲式', emoji: '🤷', description: '自我调侃的幽默' },
  { value: 'absurd', label: '荒诞幽默', emoji: '🤪', description: '夸张荒诞的搞笑' },
  { value: 'relatable', label: '共鸣式', emoji: '🎯', description: '引起强烈共鸣的幽默' },
];

function WorkplaceMemeGenerator(): React.JSX.Element {
  const [memeCategory, setMemeCategory] = useState<string>('meeting-humor');
  const [memeStyle, setMemeStyle] = useState<string>('classic-template');
  const [humorLevel, setHumorLevel] = useState<string>('mild');
  const [situation, setSituation] = useState<string>('');
  const [characters, setCharacters] = useState<string>('');
  const [specificDetails, setSpecificDetails] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [generatedMeme, setGeneratedMeme] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situation.trim()) {
      setError('请描述要制作梗图的情况！');
      setGeneratedMeme('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedMeme('');
    setGeneratedImage('');

    const selectedCategory = memeCategories.find(c => c.value === memeCategory);
    const selectedStyle = memeStyles.find(s => s.value === memeStyle);
    const selectedHumor = humorLevels.find(h => h.value === humorLevel);

    if (mode === 'text') {
      // 生成文字梗图
      const userPrompt = `
梗图类别：${selectedCategory?.label} - ${selectedCategory?.description}
梗图风格：${selectedStyle?.label} - ${selectedStyle?.description}
幽默程度：${selectedHumor?.label} - ${selectedHumor?.description}

情况描述：
${situation}

${characters.trim() ? `涉及角色：${characters}` : ''}
${specificDetails.trim() ? `具体细节：${specificDetails}` : ''}
${targetAudience.trim() ? `目标受众：${targetAudience}` : ''}

请创作一个有趣的职场梗图内容，包括文案、对话或者梗图描述。要求幽默有趣，能引起职场人的共鸣。
`;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userPrompt }],
            toolId: 'workplace-meme-generator',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '梗图生成失败，可能是段子手在思考更搞笑的内容。' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.assistantMessage) {
          setGeneratedMeme(data.assistantMessage);
        } else {
          console.warn('Unexpected API response structure:', data);
          setError('AI返回的梗图格式有误，段子手可能在重新构思笑点...😂');
        }
      } catch (e) {
        console.error('Failed to generate meme:', e);
        setError(e instanceof Error ? e.message : '生成梗图时发生未知错误，幽默细胞还需要更多时间激活！🎭');
      }
    } else {
      // 生成图片梗图
      const imagePrompt = `
Create a funny workplace meme image about: ${situation}
Category: ${selectedCategory?.label}
Style: ${selectedStyle?.label}
Characters: ${characters || 'office workers'}
Humor level: ${selectedHumor?.label}
${specificDetails ? `Details: ${specificDetails}` : ''}

Create a humorous, relatable workplace scenario that would make office workers laugh and think "that's so true!" The image should be professional but funny.
`;

      try {
        const response = await fetch('/api/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'meme'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '梗图图片生成失败，可能是AI画师在摸鱼。' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.imageUrl) {
          setGeneratedImage(data.imageUrl);
        } else {
          console.warn('Unexpected API response structure for image generation:', data);
          setError('AI返回的图片格式有点奇怪，梗图可能太抽象了...🖼️');
        }
      } catch (e) {
        console.error('Failed to generate meme image:', e);
        setError(e instanceof Error ? e.message : '生成梗图图片时发生未知错误，AI画师的幽默感可能需要充电！🎨');
      }
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <ImageIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">职场梗图生成器</h1>
        <Smile className="w-8 h-8 text-yellow-500 dark:text-yellow-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="mode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              生成模式：
            </Label>
            <Select value={mode} onValueChange={(value: 'text' | 'image') => setMode(value)}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder="选择生成模式..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                <SelectItem
                  value="text"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                    "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                  )}
                >
                  📝 文字梗图（文案描述）
                </SelectItem>
                <SelectItem
                  value="image"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                    "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                  )}
                >
                  <div className="flex flex-col">
                    <span>🎨 图片梗图（AI生成）</span>
                    <span className="text-xs text-orange-600 dark:text-orange-400"> OpenAI Key required</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memeCategory" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              梗图类别：
            </Label>
            <Select value={memeCategory} onValueChange={setMemeCategory}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder="选择梗图类别..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {memeCategories.map(category => (
                  <SelectItem
                    key={category.value}
                    value={category.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{category.emoji} {category.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{category.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memeStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              梗图风格：
            </Label>
            <Select value={memeStyle} onValueChange={setMemeStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder="选择梗图风格..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {memeStyles.map(style => (
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
            <Label htmlFor="humorLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              幽默程度：
            </Label>
            <Select value={humorLevel} onValueChange={setHumorLevel}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder="选择幽默程度..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {humorLevels.map(level => (
                  <SelectItem
                    key={level.value}
                    value={level.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{level.emoji} {level.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="situation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            情况描述：
          </Label>
          <Textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="例如：周一早上开会，老板突然点名要你发言，但你还没睡醒..."
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="characters" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              涉及角色（选填）：
            </Label>
            <Input
              id="characters"
              value={characters}
              onChange={(e) => setCharacters(e.target.value)}
              placeholder="例如：我，老板，同事小李"
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="specificDetails" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              具体细节（选填）：
            </Label>
            <Input
              id="specificDetails"
              value={specificDetails}
              onChange={(e) => setSpecificDetails(e.target.value)}
              placeholder="例如：老板戴着墨镜，会议室很暗"
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              目标受众（选填）：
            </Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例如：程序员，市场部同事"
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-neutral-900",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 生成中...</>
          ) : (
            <><Zap className="mr-2 h-4 w-4" /> 生成梗图</>
          )}
        </Button>
      </form>

      {/* Wrapper for the entire results/status section */}
      <div className={cn(
        "flex-grow mt-4 flex flex-col",
        "bg-white"
      )}>
        {error && (
          <Card className={cn(
            "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30",
            "flex-grow flex flex-col"
          )}>
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">生成失败！</CardTitle>
            </CardHeader>
            <CardContent className="text-red-600 dark:text-red-300 flex-grow">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {!error && isLoading && !generatedMeme && !generatedImage && (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 dark:text-yellow-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">梗图大师正在冥思苦想...😂</p>
          </div>
        )}

        {!error && !isLoading && generatedMeme && mode === 'text' && (
          <Card className={cn(
            "flex-grow flex flex-col shadow-inner",
            "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          )}>
            <CardHeader>
              <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
                <Smile className="w-5 h-5 mr-2" /> 你的梗图文案
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedMeme}</ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {!error && !isLoading && generatedImage && mode === 'image' && (
          <div className={cn(
            "flex-grow flex flex-col items-center justify-center p-4 rounded-lg shadow-inner",
            "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          )}>
            <CardHeader className="pb-2 pt-0">
              <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" /> 你的梗图图片
              </CardTitle>
            </CardHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImage}
              alt="Generated Meme"
              className="max-w-full max-h-[calc(100vh-450px)] object-contain rounded-md shadow-md bg-neutral-200 dark:bg-neutral-700"
              onError={() => setError('图片加载失败，可能URL无效或已过期。')}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">由 AI 生成，如有雷同，纯属巧合！</p>
          </div>
        )}

        {/* Fallback for initial empty state */}
        {!error && !isLoading && !generatedMeme && !generatedImage && (
           <div className={cn(
            "flex-grow flex flex-col items-center justify-center p-6 rounded-lg",
            "bg-neutral-50 border border-dashed border-neutral-300 dark:border-neutral-600"
          )}>
            <ImageIcon size={48} className="text-neutral-400 dark:text-neutral-500 mb-3" />
            <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
              填写以上信息，点击"生成梗图"<br />AI 将会在这里展示你的专属职场梗图！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkplaceMemeGenerator;
