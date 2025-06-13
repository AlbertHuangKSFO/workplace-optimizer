'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { Brain, Heart, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const communicationScenarios = [
  { value: 'upward', label: '向上汇报', emoji: '📈', description: '向领导汇报工作、争取资源' },
  { value: 'downward', label: '向下管理', emoji: '👥', description: '管理下属、团队激励' },
  { value: 'peer', label: '同事协作', emoji: '🤝', description: '跨部门合作、项目协调' },
  { value: 'client', label: '客户沟通', emoji: '💼', description: '客户对接、需求沟通' },
  { value: 'conflict', label: '处理冲突', emoji: '⚖️', description: '化解矛盾、协调分歧' },
  { value: 'feedback', label: '反馈建议', emoji: '💡', description: '提出建议、接受反馈' },
  { value: 'negotiation', label: '谈判协商', emoji: '🎯', description: '资源争取、条件协商' },
  { value: 'presentation', label: '汇报演示', emoji: '📊', description: '项目汇报、方案展示' },
];

function EQAssistant(): React.JSX.Element {
  const [scenario, setScenario] = useState<string>('upward');
  const [situationDescription, setSituationDescription] = useState<string>('');
  const [communicationGoal, setCommunicationGoal] = useState<string>('');
  const [eqAdvice, setEqAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situationDescription.trim()) {
      setError('请描述具体的沟通场景！');
      setEqAdvice('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEqAdvice('');

    const selectedScenario = communicationScenarios.find(s => s.value === scenario);

    const userPrompt = `
场景类型：${selectedScenario?.label} - ${selectedScenario?.description}
具体情况：${situationDescription}
${communicationGoal.trim() ? `沟通目标：${communicationGoal}` : ''}

请为我提供高情商的沟通策略和具体话术建议。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'eq-assistant',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '情商助手暂时下线，可能在学习新的沟通技巧。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setEqAdvice(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的建议格式有误，情商助手可能在思考人生...🤔');
      }
    } catch (e) {
      console.error('Failed to get EQ advice:', e);
      setError(e instanceof Error ? e.message : '获取情商建议时发生未知错误，助手的情商可能也需要充值！💡');
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">职场情商助手</h1>
        <Brain className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="scenario" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            沟通场景：
          </Label>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder="选择沟通场景..." />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {communicationScenarios.map(scene => (
                <SelectItem
                  key={scene.value}
                  value={scene.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  <div className="flex flex-col">
                    <span>{scene.emoji} {scene.label}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{scene.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="situationDescription" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            具体情况描述：
          </Label>
          <Textarea
            id="situationDescription"
            value={situationDescription}
            onChange={(e) => setSituationDescription(e.target.value)}
            placeholder="例如：需要向老板汇报项目延期，但担心被批评，希望能获得更多资源支持..."
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="communicationGoal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            沟通目标（选填）：
          </Label>
          <Textarea
            id="communicationGoal"
            value={communicationGoal}
            onChange={(e) => setCommunicationGoal(e.target.value)}
            placeholder="例如：获得理解和支持，争取更多时间或人力资源..."
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 情商大师正在分析人际关系...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 获取高情商建议！</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">情商充值失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !eqAdvice && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 dark:text-pink-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">AI情商导师正在分析人际动态，制定沟通策略...💝</p>
        </div>
      )}

      {eqAdvice && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-pink-700 dark:text-pink-400 flex items-center">
              <Heart className="w-5 h-5 mr-2" /> 高情商沟通建议
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{eqAdvice}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EQAssistant;
