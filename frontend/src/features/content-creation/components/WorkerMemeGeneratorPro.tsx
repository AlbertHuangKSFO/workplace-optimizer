'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, ImagePlay, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface MemeData {
  memeText: string;
  imageDescription: string;
  memeType: string;
  usage: string;
  alternatives: Array<{
    text: string;
    description: string;
  }>;
}

export default function WorkerMemeGeneratorPro() {
  const [scenario, setScenario] = useState('');
  const [memeType, setMemeType] = useState('');
  const [mood, setMood] = useState('');
  const [result, setResult] = useState<MemeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const memeTypes = [
    { value: 'classic-complaint', label: '经典吐槽型' },
    { value: 'self-mockery', label: '自嘲幽默型' },
    { value: 'motivational-irony', label: '励志鸡汤型' },
    { value: 'reality-check', label: '现实扎心型' },
    { value: 'dream-vs-reality', label: '梦想对比型' },
    { value: 'boss-employee', label: '老板员工型' },
    { value: 'slacking-special', label: '摸鱼专用型' },
    { value: 'overtime-culture', label: '加班熬夜型' },
  ];

  const moods = [
    { value: 'frustrated', label: '抓狂愤怒' },
    { value: 'helpless', label: '无奈躺平' },
    { value: 'sarcastic', label: '讽刺调侃' },
    { value: 'optimistic', label: '乐观自嘲' },
    { value: 'desperate', label: '绝望崩溃' },
    { value: 'sneaky', label: '偷偷摸鱼' },
    { value: 'ambitious', label: '雄心壮志' },
    { value: 'tired', label: '疲惫不堪' },
  ];

  const quickScenarios = [
    '老板又要求加班',
    '工资还没发',
    '被安排做不是自己工作的事',
    '开会开到怀疑人生',
    '摸鱼被发现了',
    '周一上班综合症',
    '想辞职但不敢',
    '同事甩锅给我',
    '客户需求又变了',
    '年终奖泡汤了'
  ];

  const handleGenerate = async () => {
    if (!scenario.trim()) {
      alert('请输入场景描述');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'worker-meme-generator-pro',
          messages: [
            {
              role: 'user',
              content: `请为我生成一个打工人表情包。

场景描述：${scenario}
${memeType ? `表情包类型：${memeTypes.find(t => t.value === memeType)?.label}` : ''}
${mood ? `情绪风格：${moods.find(m => m.value === mood)?.label}` : ''}

请生成符合这个场景的表情包内容。`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();

      try {
        const memeData = JSON.parse(data.assistantMessage);
        setResult(memeData);
        setGeneratedImage(null); // 重置图片
      } catch (parseError) {
        console.error('解析JSON失败:', parseError);
        alert('生成的内容格式有误，请重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('生成过程中出现错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (imageDescription: string) => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create a meme-style image: ${imageDescription}. Style: cartoon, expressive, suitable for internet meme, clear facial expressions, office/workplace setting`,
          size: '1024x1024'
        }),
      });

      if (!response.ok) {
        throw new Error('图片生成失败');
      }

      const imageData = await response.json();
      setGeneratedImage(imageData.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('图片生成失败，请稍后重试。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'worker-meme.png';
      link.click();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">😂 打工人表情包生成器 Pro</h1>
        <p className="text-muted-foreground">
          专业定制打工人专属表情包，让你的吐槽更有艺术感
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>创作设置</CardTitle>
            <CardDescription>
              描述你想要表达的场景和情绪
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario">场景描述 *</Label>
              <Textarea
                id="scenario"
                placeholder="描述你遇到的工作场景，比如：老板又要求周末加班，但是不给加班费..."
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>快速场景</Label>
              <div className="flex flex-wrap gap-2">
                {quickScenarios.map((s, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setScenario(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meme-type">表情包类型</Label>
                <Select value={memeType} onValueChange={setMemeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    {memeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">情绪风格</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择情绪（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创作中...
                </>
              ) : (
                <>
                  <ImagePlay className="mr-2 h-4 w-4" />
                  生成表情包
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 结果展示区域 */}
        <Card>
          <CardHeader>
            <CardTitle>表情包预览</CardTitle>
            <CardDescription>
              你的专属打工人表情包
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* 主要表情包 */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-2">
                        {result.memeType}
                      </Badge>
                      <div className="text-lg font-bold bg-white dark:bg-gray-800 p-3 rounded border-2 border-dashed">
                        {result.memeText}
                      </div>
                    </div>

                    {generatedImage ? (
                      <div className="text-center space-y-2">
                        <img
                          src={generatedImage}
                          alt="Generated meme"
                          className="max-w-full h-auto rounded-lg border mx-auto"
                          style={{ maxHeight: '300px' }}
                        />
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" onClick={downloadImage}>
                            <Download className="mr-1 h-3 w-3" />
                            下载
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.memeText)}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            复制文案
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground p-3 bg-white dark:bg-gray-800 rounded border">
                          图片描述：{result.imageDescription}
                        </div>
                        <Button
                          onClick={() => handleGenerateImage(result.imageDescription)}
                          disabled={isGeneratingImage}
                          size="sm"
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              生成图片中...
                            </>
                          ) : (
                            <>
                              <ImagePlay className="mr-1 h-3 w-3" />
                              生成图片
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground text-center">
                      适用场景：{result.usage}
                    </div>
                  </div>
                </div>

                {/* 备选方案 */}
                {result.alternatives && result.alternatives.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">备选方案</h4>
                    {result.alternatives.map((alt, index) => (
                      <div key={index} className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="font-medium mb-1">{alt.text}</div>
                        <div className="text-sm text-muted-foreground mb-2">{alt.description}</div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateImage(alt.description)}
                            disabled={isGeneratingImage}
                          >
                            <ImagePlay className="mr-1 h-3 w-3" />
                            生成图片
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(alt.text)}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            复制
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-6xl mb-4">😴</div>
                <p>填写场景描述，开始创作你的专属表情包</p>
                <div className="mt-4 text-sm space-y-1">
                  <p>💡 小贴士：</p>
                  <p>描述越具体，生成的表情包越贴切</p>
                  <p>可以包含具体的对话、动作、表情等</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
