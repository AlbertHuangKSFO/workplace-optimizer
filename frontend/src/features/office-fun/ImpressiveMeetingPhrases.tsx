'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
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
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100")}>
      {!showResult ? (
        <div className="space-y-6">
          {/* 标题部分 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                高大上会议用语生成器
              </h1>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              开会时不知道说什么？让AI为您准备专业话术，助您在会议中"谈笑风生"！🎭✨
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors flex items-center gap-1",
                "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              )}>
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                完成度: {getCompletionRate()}%
              </div>
              <div className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors flex items-center gap-1",
                "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              )}>
                <Lightbulb className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                装B神器
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-200 dark:bg-neutral-800" />

          <div className="space-y-6">
            {/* 会议类型选择 */}
            <Card className={cn(
              "border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                  )}>
                    1
                  </span>
                  选择会议类型
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">不同类型的会议需要不同的话术风格</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {meetingTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={meetingType === type.id ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 text-left justify-start",
                        meetingType === type.id ?
                          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={() => setMeetingType(type.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{type.label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{type.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 表演效果选择 */}
            <Card className={cn(
              "border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                  )}>
                    2
                  </span>
                  选择表演效果
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">您希望在会议中给人留下什么印象？</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {performanceEffects.map((eff) => (
                    <Button
                      key={eff.id}
                      variant={effect === eff.id ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 text-left justify-start",
                        effect === eff.id ?
                          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={() => setEffect(eff.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{eff.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{eff.label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{eff.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 自定义主题（可选）*/}
            <Card className={cn(
              "border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  )}>
                    ?⃝
                  </span>
                  自定义会议主题（可选）
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">更具体的主题能生成更精准的话术</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="customTopic" className="sr-only">自定义会议主题</Label>
                <Textarea
                  id="customTopic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="例如：关于Q3季度营销策略的讨论、如何提升团队协作效率..."
                  rows={3}
                  className={cn(
                    "w-full",
                    "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                    "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  )}
                />
              </CardContent>
            </Card>

            {error && <p className="text-red-600 dark:text-red-400 text-center py-2">{error}</p>}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !meetingType || !effect}
                className={cn(
                  "w-full max-w-md py-3 text-lg font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-shadow",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600",
                  "disabled:from-neutral-400 disabled:to-neutral-500 dark:disabled:from-neutral-600 dark:disabled:to-neutral-700 disabled:text-neutral-300 dark:disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 animate-spin" />
                    AI正在生成话术...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
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
          {/* 结果页标题 */}
          <div className="text-center space-y-2">
             <div className="flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
                您的会议话术已生成！
              </h1>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              请查收AI为您精心准备的会议发言锦囊，助您掌控全场！
            </p>
          </div>

          <Separator className="bg-neutral-200 dark:bg-neutral-800" />

          <Card className={cn(
            "shadow-xl border-2",
            "bg-neutral-50 dark:bg-neutral-900 border-blue-200 dark:border-blue-800"
          )}>
            <CardHeader>
              <CardTitle className={cn("text-xl flex items-center gap-2", "text-blue-700 dark:text-blue-300")}>
                <Lightbulb className="w-6 h-6" />
                会议话术锦囊
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(
              "prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words p-4 sm:p-6",
              "text-neutral-800 dark:text-neutral-200"
            )}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                "px-8 py-3 text-lg font-semibold rounded-lg shadow hover:shadow-md transition-shadow",
                "border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30",
                "dark:hover:text-blue-200"
              )}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              重新生成
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImpressiveMeetingPhrases;
