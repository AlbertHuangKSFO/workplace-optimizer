'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Heart, Loader2, Sparkles, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const teamSizes = [
  { value: 'small', label: '小团队 (3-8人)', emoji: '👥', description: '紧密协作的小型团队' },
  { value: 'medium', label: '中等团队 (9-20人)', emoji: '👨‍👩‍👧‍👦', description: '中等规模的工作团队' },
  { value: 'large', label: '大团队 (21-50人)', emoji: '🏢', description: '大型部门或项目团队' },
  { value: 'department', label: '部门级别 (50+人)', emoji: '🏛️', description: '整个部门或事业部' },
];

const observationPeriods = [
  { value: 'recent', label: '最近一周', emoji: '📅', description: '近期的团队状态' },
  { value: 'monthly', label: '最近一个月', emoji: '📊', description: '月度团队表现' },
  { value: 'quarterly', label: '最近一季度', emoji: '📈', description: '季度团队发展' },
  { value: 'ongoing', label: '持续观察', emoji: '🔍', description: '长期的团队动态' },
];

const analysisTypes = [
  { value: 'comprehensive', label: '综合分析', emoji: '🎯', description: '全面的团队氛围评估' },
  { value: 'communication', label: '沟通状况', emoji: '💬', description: '团队沟通效率和质量' },
  { value: 'collaboration', label: '协作效果', emoji: '🤝', description: '团队协作和配合情况' },
  { value: 'motivation', label: '工作积极性', emoji: '⚡', description: '团队成员的工作热情' },
  { value: 'stress-level', label: '压力水平', emoji: '😰', description: '团队整体压力状况' },
  { value: 'satisfaction', label: '满意度', emoji: '😊', description: '工作满意度和幸福感' },
];

function TeamMoodDetector(): React.JSX.Element {
  const [teamSize, setTeamSize] = useState<string>('medium');
  const [observationPeriod, setObservationPeriod] = useState<string>('recent');
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [teamDescription, setTeamDescription] = useState<string>('');
  const [observedBehaviors, setObservedBehaviors] = useState<string>('');
  const [specificConcerns, setSpecificConcerns] = useState<string>('');
  const [recentEvents, setRecentEvents] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamDescription.trim()) {
      setError('请描述您的团队基本情况！');
      setAnalysisResult('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    const selectedTeamSize = teamSizes.find(t => t.value === teamSize);
    const selectedPeriod = observationPeriods.find(p => p.value === observationPeriod);
    const selectedAnalysis = analysisTypes.find(a => a.value === analysisType);

    const userPrompt = `
团队规模：${selectedTeamSize?.label} - ${selectedTeamSize?.description}
观察周期：${selectedPeriod?.label} - ${selectedPeriod?.description}
分析重点：${selectedAnalysis?.label} - ${selectedAnalysis?.description}

团队描述：
${teamDescription}

${observedBehaviors.trim() ? `观察到的行为：${observedBehaviors}` : ''}
${specificConcerns.trim() ? `具体关注点：${specificConcerns}` : ''}
${recentEvents.trim() ? `近期重要事件：${recentEvents}` : ''}

请分析团队氛围状况，提供专业的评估报告和改进建议。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'team-mood-detector',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '氛围分析失败，可能是团队心理专家在深入思考。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAnalysisResult(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的分析格式有误，团队心理专家可能在重新整理思路...👥');
      }
    } catch (e) {
      console.error('Failed to analyze team mood:', e);
      setError(e instanceof Error ? e.message : '分析团队氛围时发生未知错误，团队诊断需要更多时间！💭');
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Users className="w-8 h-8 text-cyan-500 dark:text-cyan-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">团队氛围检测器</h1>
        <Heart className="w-8 h-8 text-cyan-500 dark:text-cyan-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="teamSize" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              团队规模：
            </Label>
            <Select value={teamSize} onValueChange={setTeamSize}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}>
                <SelectValue placeholder="选择团队规模..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {teamSizes.map(size => (
                  <SelectItem
                    key={size.value}
                    value={size.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-cyan-100 dark:focus:bg-cyan-700/50",
                      "data-[state=checked]:bg-cyan-200 dark:data-[state=checked]:bg-cyan-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{size.emoji} {size.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{size.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="observationPeriod" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              观察周期：
            </Label>
            <Select value={observationPeriod} onValueChange={setObservationPeriod}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}>
                <SelectValue placeholder="选择观察周期..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {observationPeriods.map(period => (
                  <SelectItem
                    key={period.value}
                    value={period.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-cyan-100 dark:focus:bg-cyan-700/50",
                      "data-[state=checked]:bg-cyan-200 dark:data-[state=checked]:bg-cyan-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{period.emoji} {period.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{period.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="analysisType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              分析重点：
            </Label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}>
                <SelectValue placeholder="选择分析重点..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {analysisTypes.map(analysis => (
                  <SelectItem
                    key={analysis.value}
                    value={analysis.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-cyan-100 dark:focus:bg-cyan-700/50",
                      "data-[state=checked]:bg-cyan-200 dark:data-[state=checked]:bg-cyan-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{analysis.emoji} {analysis.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{analysis.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="teamDescription" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            团队描述：
          </Label>
          <Textarea
            id="teamDescription"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="描述您的团队基本情况，如部门职能、工作性质、团队组成等..."
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
            )}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="observedBehaviors" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            观察到的行为（选填）：
          </Label>
          <Textarea
            id="observedBehaviors"
            value={observedBehaviors}
            onChange={(e) => setObservedBehaviors(e.target.value)}
            placeholder="例如：成员间互动减少、会议效率低下、抱怨增多、加班常态化..."
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
            )}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specificConcerns" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              具体关注点（选填）：
            </Label>
            <Textarea
              id="specificConcerns"
              value={specificConcerns}
              onChange={(e) => setSpecificConcerns(e.target.value)}
              placeholder="例如：新项目压力、团队成员流失、领导风格问题..."
              className={cn(
                "w-full min-h-[60px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="recentEvents" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              近期重要事件（选填）：
            </Label>
            <Textarea
              id="recentEvents"
              value={recentEvents}
              onChange={(e) => setRecentEvents(e.target.value)}
              placeholder="例如：组织架构调整、重要项目上线、季度绩效考核..."
              className={cn(
                "w-full min-h-[60px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}
              rows={2}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 分析中...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 检测团队氛围</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">分析失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !analysisResult && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 dark:text-cyan-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">团队心理专家正在深入分析团队氛围...💭</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" /> 团队氛围分析报告
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TeamMoodDetector;
