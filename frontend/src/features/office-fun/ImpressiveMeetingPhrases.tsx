import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Textarea } from '@/components/ui/Textarea';
import { Briefcase, Lightbulb, RotateCcw, Target, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingType {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

interface PerformanceEffect {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const meetingTypes: MeetingType[] = [
  { id: 'strategy', label: '战略规划会', emoji: '🎯', description: '高屋建瓴，指点江山' },
  { id: 'product', label: '产品讨论会', emoji: '💡', description: '创新思维，用户至上' },
  { id: 'project', label: '项目推进会', emoji: '📊', description: '数据驱动，执行力强' },
  { id: 'review', label: '复盘总结会', emoji: '🔍', description: '深度思考，举一反三' },
  { id: 'brainstorm', label: '头脑风暴会', emoji: '🌪️', description: '天马行空，碰撞火花' },
  { id: 'general', label: '通用场景', emoji: '🎭', description: '万能话术，随机应变' }
];

const performanceEffects: PerformanceEffect[] = [
  { id: 'thoughtful', label: '深思熟虑型', emoji: '🤔', description: '显得很有想法，思考深入' },
  { id: 'proactive', label: '积极参与型', emoji: '🙋‍♂️', description: '主动发言，展现参与度' },
  { id: 'strategic', label: '把握大局型', emoji: '🎯', description: '站在高度，看得长远' },
  { id: 'analytical', label: '数据分析型', emoji: '📈', description: '用数据说话，逻辑清晰' },
  { id: 'innovative', label: '创新思维型', emoji: '💡', description: '脑洞大开，与众不同' },
  { id: 'safe', label: '安全过关型', emoji: '🛡️', description: '不出错，稳妥应对' }
];

function ImpressiveMeetingPhrases(): React.JSX.Element {
  const [meetingType, setMeetingType] = useState<string>('');
  const [effect, setEffect] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!meetingType || !effect) {
      setError('请选择会议类型和表演效果');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const selectedMeetingType = meetingTypes.find(t => t.id === meetingType);
      const selectedEffect = performanceEffects.find(e => e.id === effect);

      let prompt = `会议类型：${selectedMeetingType?.label} (${selectedMeetingType?.description})\n`;
      prompt += `表演效果：${selectedEffect?.label} (${selectedEffect?.description})\n`;

      if (customTopic.trim()) {
        prompt += `会议主题：${customTopic.trim()}\n`;
      }

      prompt += '\n请为我生成一些高大上的会议用语和话术，帮助我在会议中显得专业和有见地！';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          toolId: 'impressive-meeting-phrases',
          language: 'zh'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.assistantMessage);
      setShowResult(true);
    } catch (error) {
      console.error('Error:', error);
      setError('生成失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMeetingType('');
    setEffect('');
    setCustomTopic('');
    setResult('');
    setError('');
    setShowResult(false);
  };

  const getCompletionRate = () => {
    let completed = 0;
    if (meetingType) completed++;
    if (effect) completed++;
    return Math.round((completed / 2) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!showResult ? (
        <div className="space-y-6">
          {/* 标题部分 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                高大上会议用语生成器
              </h1>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              开会时不知道说什么？让AI为您准备专业话术，助您在会议中"谈笑风生"！🎭✨
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-neutral-100 border-neutral-600 flex items-center gap-1">
                <Target className="w-4 h-4" />
                完成度: {getCompletionRate()}%
              </div>
              <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-neutral-100 border-neutral-600 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                装B神器
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {/* 会议类型选择 */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    1
                  </span>
                  选择会议类型
                </CardTitle>
                <CardDescription>不同类型的会议需要不同的话术风格</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {meetingTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={meetingType === type.id ? "default" : "outline"}
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => setMeetingType(type.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 表演效果选择 */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    2
                  </span>
                  选择表演效果
                </CardTitle>
                <CardDescription>您希望在会议中给人留下什么印象？</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {performanceEffects.map((eff) => (
                    <Button
                      key={eff.id}
                      variant={effect === eff.id ? "default" : "outline"}
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => setEffect(eff.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{eff.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{eff.label}</div>
                          <div className="text-xs text-muted-foreground">{eff.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 自定义主题 */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    3
                  </span>
                  会议主题（可选）
                </CardTitle>
                <CardDescription>告诉我具体的会议主题，生成更精准的话术</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="topic">会议主题或关键词</Label>
                  <Textarea
                    id="topic"
                    placeholder="例如：Q4业绩回顾、新产品上线策略、团队协作优化、数字化转型..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600 text-center">{error}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !meetingType || !effect}
                className="px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    正在生成话术...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    生成高大上话术
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Briefcase className="w-6 h-6 text-white" />
                您的专属会议话术宝典
              </CardTitle>
              <CardDescription className="text-gray-300">
                精心为您定制的高大上会议用语（请酌情使用，注意场合）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-left leading-relaxed space-y-3 text-white">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-white" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-white" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 text-white leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-white" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-white" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-white" {...props} />,
                    li: ({node, ...props}) => <li className="text-white" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-300" {...props} />,
                    code: ({node, ...props}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-white" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-4 border-gray-600" {...props} />
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleReset} variant="outline" className="px-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新生成话术
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImpressiveMeetingPhrases;
