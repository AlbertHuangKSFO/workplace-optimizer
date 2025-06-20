'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
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

interface Props {
  locale: ValidLocale;
}

export default function WorkerMemeGeneratorPro({ locale }: Props) {
  const { t, loading } = useTranslations(locale);
  const [scenario, setScenario] = useState('');
  const [memeType, setMemeType] = useState('');
  const [mood, setMood] = useState('');
  const [result, setResult] = useState<MemeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const memeTypes = [
    { value: 'classic-complaint', label: t('workerMemeGeneratorPro.memeTypes.classic-complaint') },
    { value: 'self-mockery', label: t('workerMemeGeneratorPro.memeTypes.self-mockery') },
    { value: 'motivational-irony', label: t('workerMemeGeneratorPro.memeTypes.motivational-irony') },
    { value: 'reality-check', label: t('workerMemeGeneratorPro.memeTypes.reality-check') },
    { value: 'dream-vs-reality', label: t('workerMemeGeneratorPro.memeTypes.dream-vs-reality') },
    { value: 'boss-employee', label: t('workerMemeGeneratorPro.memeTypes.boss-employee') },
    { value: 'slacking-special', label: t('workerMemeGeneratorPro.memeTypes.slacking-special') },
    { value: 'overtime-culture', label: t('workerMemeGeneratorPro.memeTypes.overtime-culture') },
  ];

  const moods = [
    { value: 'frustrated', label: t('workerMemeGeneratorPro.moods.frustrated') },
    { value: 'helpless', label: t('workerMemeGeneratorPro.moods.helpless') },
    { value: 'sarcastic', label: t('workerMemeGeneratorPro.moods.sarcastic') },
    { value: 'optimistic', label: t('workerMemeGeneratorPro.moods.optimistic') },
    { value: 'desperate', label: t('workerMemeGeneratorPro.moods.desperate') },
    { value: 'sneaky', label: t('workerMemeGeneratorPro.moods.sneaky') },
    { value: 'ambitious', label: t('workerMemeGeneratorPro.moods.ambitious') },
    { value: 'tired', label: t('workerMemeGeneratorPro.moods.tired') },
  ];

  const quickScenariosRaw = t('workerMemeGeneratorPro.quickScenarios');
  const quickScenarios = Array.isArray(quickScenariosRaw) ? quickScenariosRaw : (
    locale === 'en-US' ? [
      "Boss requires overtime again",
      "Salary hasn't been paid yet",
      "Assigned work that's not my job",
      "Meeting that makes me question life",
      "Got caught slacking off",
      "Monday work syndrome",
      "Want to quit but don't dare",
      "Colleague throws me under the bus",
      "Client requirements changed again",
      "Year-end bonus evaporated"
    ] : [
      "老板又要求加班",
      "工资还没发",
      "被安排做不是自己工作的事",
      "开会开到怀疑人生",
      "摸鱼被发现了",
      "周一上班综合症",
      "想辞职但不敢",
      "同事甩锅给我",
      "客户需求又变了",
      "年终奖泡汤了"
    ]
  );

  const handleGenerate = async () => {
    if (!scenario.trim()) {
      alert(t('workerMemeGeneratorPro.scenarioRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // 发送JSON格式的数据给后端
      const payload = {
        scenario: scenario,
        mood: mood ? moods.find(m => m.value === mood)?.value : undefined,
        memeType: memeType || undefined
      };

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
              content: JSON.stringify(payload)
            }
          ],
          language: locale,
        }),
      });

      if (!response.ok) {
        throw new Error(t('workerMemeGeneratorPro.generationFailed'));
      }

      const data = await response.json();

      try {
        const memeData = JSON.parse(data.assistantMessage);
        setResult(memeData);
        setGeneratedImage(null); // 重置图片
      } catch (parseError) {
        console.error('解析JSON失败:', parseError);
        alert(t('workerMemeGeneratorPro.parseError'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('workerMemeGeneratorPro.unknownError'));
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
        throw new Error(t('workerMemeGeneratorPro.imageGenerationFailed'));
      }

      const imageData = await response.json();
      setGeneratedImage(imageData.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert(t('workerMemeGeneratorPro.imageGenerationFailed'));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t('workerMemeGeneratorPro.textCopied'));
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
        <h1 className="text-3xl font-bold mb-2">😂 {t('workerMemeGeneratorPro.title')}</h1>
        <p className="text-muted-foreground">
          {t('workerMemeGeneratorPro.description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('workerMemeGeneratorPro.creationSettings')}</CardTitle>
            <CardDescription>
              {t('workerMemeGeneratorPro.creationSettingsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario">{t('workerMemeGeneratorPro.scenarioLabel')} *</Label>
              <Textarea
                id="scenario"
                placeholder={t('workerMemeGeneratorPro.scenarioPlaceholder')}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('workerMemeGeneratorPro.quickScenario')}</Label>
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

            <div className="space-y-2">
              <Label>{t('workerMemeGeneratorPro.memeTypeLabel')}</Label>
              <Select value={memeType} onValueChange={setMemeType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('workerMemeGeneratorPro.memeTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {memeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('workerMemeGeneratorPro.moodLabel')}</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder={t('workerMemeGeneratorPro.moodPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {moods.map(moodOption => (
                    <SelectItem key={moodOption.value} value={moodOption.value}>{moodOption.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !scenario.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('workerMemeGeneratorPro.generating')}
                </>
              ) : (
                t('workerMemeGeneratorPro.generate')
              )}
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t('workerMemeGeneratorPro.tips')}</p>
              <p>• {t('workerMemeGeneratorPro.tip1')}</p>
              <p>• {t('workerMemeGeneratorPro.tip2')}</p>
            </div>
          </CardContent>
        </Card>

        {/* 结果区域 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('workerMemeGeneratorPro.result')}</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* 表情包文案 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">{t('workerMemeGeneratorPro.memeText')}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.memeText)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {t('workerMemeGeneratorPro.copyText')}
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg font-medium">{result.memeText}</p>
                  </div>
                </div>

                {/* 图片描述和生成 */}
                {result.imageDescription && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">{t('workerMemeGeneratorPro.imageDescription')}</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{result.imageDescription}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateImage(result.imageDescription)}
                      disabled={isGeneratingImage}
                      className="w-full"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('workerMemeGeneratorPro.generatingImage')}
                        </>
                      ) : (
                        <>
                          <ImagePlay className="mr-2 h-4 w-4" />
                          {t('workerMemeGeneratorPro.generateImage')}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* 生成的图片 */}
                {generatedImage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Generated Image</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadImage}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t('workerMemeGeneratorPro.downloadImage')}
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={generatedImage}
                        alt="Generated meme"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {/* 使用场景 */}
                {result.usage && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">{t('workerMemeGeneratorPro.usage')}</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{result.usage}</p>
                    </div>
                  </div>
                )}

                {/* 备选方案 */}
                {result.alternatives && result.alternatives.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">{t('workerMemeGeneratorPro.alternatives')}</Label>
                    <div className="space-y-2">
                      {result.alternatives.map((alt, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">{alt.text}</p>
                          {alt.description && (
                            <p className="text-sm text-muted-foreground mt-1">{alt.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('workerMemeGeneratorPro.emptyState')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
