'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Image, Loader2, Smile, Zap } from 'lucide-react';
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
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <Image className="w-8 h-8 text-yellow-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">职场梗图生成器</h1>
        <Smile className="w-8 h-8 text-yellow-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="mode" className="block text-sm font-medium text-neutral-300 mb-2">
              生成模式：
            </Label>
            <Select value={mode} onValueChange={(value: 'text' | 'image') => setMode(value)}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择生成模式..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                <SelectItem value="text" className="hover:bg-neutral-700 focus:bg-sky-700">
                  📝 文字梗图（文案描述）
                </SelectItem>
                <SelectItem value="image" className="hover:bg-neutral-700 focus:bg-sky-700">
                  🎨 图片梗图（AI生成）- 仅支持OpenAI
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memeCategory" className="block text-sm font-medium text-neutral-300 mb-2">
              梗图类别：
            </Label>
            <Select value={memeCategory} onValueChange={setMemeCategory}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择梗图类别..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {memeCategories.map(category => (
                  <SelectItem key={category.value} value={category.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    <div className="flex flex-col">
                      <span>{category.emoji} {category.label}</span>
                      <span className="text-xs text-neutral-400">{category.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memeStyle" className="block text-sm font-medium text-neutral-300 mb-2">
              梗图风格：
            </Label>
            <Select value={memeStyle} onValueChange={setMemeStyle}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择梗图风格..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {memeStyles.map(style => (
                  <SelectItem key={style.value} value={style.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    <div className="flex flex-col">
                      <span>{style.emoji} {style.label}</span>
                      <span className="text-xs text-neutral-400">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="humorLevel" className="block text-sm font-medium text-neutral-300 mb-2">
              幽默程度：
            </Label>
            <Select value={humorLevel} onValueChange={setHumorLevel}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择幽默程度..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {humorLevels.map(humor => (
                  <SelectItem key={humor.value} value={humor.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    <div className="flex flex-col">
                      <span>{humor.emoji} {humor.label}</span>
                      <span className="text-xs text-neutral-400">{humor.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {mode === 'image' && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-300">
            <p className="flex items-center">
              <Image className="w-4 h-4 mr-2" />
              图片生成功能仅支持 OpenAI DALL-E 模型，需要配置有效的 OpenAI API Key。
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="situation" className="block text-sm font-medium text-neutral-300 mb-2">
            情况描述：
          </Label>
          <Textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="描述要制作梗图的职场情况，如开会时的尴尬瞬间、加班时的心理活动、与同事的搞笑对话等..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[120px]"
            rows={5}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="characters" className="block text-sm font-medium text-neutral-300 mb-2">
              涉及角色（选填）：
            </Label>
            <Input
              id="characters"
              value={characters}
              onChange={(e) => setCharacters(e.target.value)}
              placeholder="例如：老板、同事、产品经理、程序员..."
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <Label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-300 mb-2">
              目标受众（选填）：
            </Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例如：程序员、设计师、产品经理、销售..."
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="specificDetails" className="block text-sm font-medium text-neutral-300 mb-2">
            具体细节（选填）：
          </Label>
          <Textarea
            id="specificDetails"
            value={specificDetails}
            onChange={(e) => setSpecificDetails(e.target.value)}
            placeholder="补充一些具体的细节，如特定的对话、表情、动作等，让梗图更生动..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
            rows={3}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {mode === 'text' ? '段子手正在创作梗图...' : 'AI画师正在制作梗图...'}
            </>
          ) : (
            <>{mode === 'text' ? <><Zap className="mr-2 h-4 w-4" /> 生成搞笑梗图！</> : <><Image className="mr-2 h-4 w-4" /> AI帮我画梗图！</>}
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">梗图生成失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedMeme && !generatedImage && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mb-4" />
          <p className="text-neutral-400">
            {mode === 'text' ? 'AI段子手正在为您创作搞笑的职场梗图...😂✨' : 'AI画师正在制作专属职场梗图...🎨✨'}
          </p>
        </div>
      )}

      {generatedMeme && !isLoading && mode === 'text' && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Smile className="w-5 h-5 mr-2" /> 您的专属职场梗图（文字版）
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedMeme}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {generatedImage && !isLoading && mode === 'image' && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Image className="w-5 h-5 mr-2" /> 您的专属职场梗图（图片版）
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center p-6">
            <div className="max-w-full max-h-full">
              <img
                src={generatedImage}
                alt="AI生成的职场梗图"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  setError('图片加载失败，可能是梗图太搞笑服务器都笑懵了！😅');
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WorkplaceMemeGenerator;
