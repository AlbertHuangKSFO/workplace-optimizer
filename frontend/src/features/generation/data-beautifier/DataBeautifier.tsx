'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BarChart3, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const reportTypes = [
  { value: 'weekly', label: '周报数据', emoji: '📅', description: '周度工作成果汇报' },
  { value: 'monthly', label: '月报数据', emoji: '📊', description: '月度业务数据总结' },
  { value: 'quarterly', label: '季报数据', emoji: '📈', description: '季度业绩汇报' },
  { value: 'project', label: '项目数据', emoji: '🎯', description: '项目进展和成果' },
  { value: 'performance', label: '绩效数据', emoji: '⭐', description: '个人或团队绩效' },
  { value: 'business', label: '业务数据', emoji: '💼', description: '业务指标和分析' },
];

const audienceTypes = [
  { value: 'leadership', label: '领导层', emoji: '👔', description: '高管、总监级别' },
  { value: 'peers', label: '同事同级', emoji: '🤝', description: '平级同事、合作伙伴' },
  { value: 'team', label: '团队成员', emoji: '👥', description: '下属、团队内部' },
  { value: 'client', label: '客户方', emoji: '🤝', description: '外部客户、合作方' },
  { value: 'stakeholders', label: '利益相关方', emoji: '🎯', description: '项目相关各方' },
];

const beautifyStyles = [
  { value: 'professional', label: '专业严谨', emoji: '🎩', description: '正式专业，数据准确' },
  { value: 'storytelling', label: '故事叙述', emoji: '📖', description: '情节生动，引人入胜' },
  { value: 'achievement', label: '成就导向', emoji: '🏆', description: '突出成果，展现价值' },
  { value: 'analytical', label: '分析洞察', emoji: '🔍', description: '深度分析，洞察趋势' },
  { value: 'visual', label: '可视化描述', emoji: '📊', description: '图表化表达，直观易懂' },
  { value: 'inspiring', label: '激励人心', emoji: '🚀', description: '正能量满满，鼓舞士气' },
];

function DataBeautifier(): React.JSX.Element {
  const [reportType, setReportType] = useState<string>('weekly');
  const [audienceType, setAudienceType] = useState<string>('leadership');
  const [beautifyStyle, setBeautifyStyle] = useState<string>('professional');
  const [rawData, setRawData] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [beautifiedData, setBeautifiedData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rawData.trim()) {
      setError('请输入需要美化的原始数据！');
      setBeautifiedData('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBeautifiedData('');

    const selectedReportType = reportTypes.find(r => r.value === reportType);
    const selectedAudience = audienceTypes.find(a => a.value === audienceType);
    const selectedStyle = beautifyStyles.find(s => s.value === beautifyStyle);

    const userPrompt = `
汇报类型：${selectedReportType?.label} - ${selectedReportType?.description}
目标受众：${selectedAudience?.label} - ${selectedAudience?.description}
美化风格：${selectedStyle?.label} - ${selectedStyle?.description}

原始数据：
${rawData}

${context.trim() ? `背景信息：${context}` : ''}
${goals.trim() ? `汇报目标：${goals}` : ''}

请将这些枯燥的数据转化为生动、有说服力、易于理解的文字描述，突出亮点和价值。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'data-beautifier',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '数据美化失败，可能是数据分析师在寻找更好的表达方式。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setBeautifiedData(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的美化结果格式有误，数据分析师可能在重新整理思路...📊');
      }
    } catch (e) {
      console.error('Failed to beautify data:', e);
      setError(e instanceof Error ? e.message : '美化数据时发生未知错误，数据的魅力还需要时间来展现！✨');
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <BarChart3 className="w-8 h-8 text-green-500 dark:text-green-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">汇报数据美化器</h1>
        <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="reportType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              汇报类型：
            </Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              )}>
                <SelectValue placeholder="选择汇报类型..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {reportTypes.map(type => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-green-100 dark:focus:bg-green-700/50",
                      "data-[state=checked]:bg-green-200 dark:data-[state=checked]:bg-green-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{type.emoji} {type.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="audienceType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              目标受众：
            </Label>
            <Select value={audienceType} onValueChange={setAudienceType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              )}>
                <SelectValue placeholder="选择目标受众..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {audienceTypes.map(audience => (
                  <SelectItem
                    key={audience.value}
                    value={audience.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-green-100 dark:focus:bg-green-700/50",
                      "data-[state=checked]:bg-green-200 dark:data-[state=checked]:bg-green-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{audience.emoji} {audience.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{audience.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="beautifyStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              美化风格：
            </Label>
            <Select value={beautifyStyle} onValueChange={setBeautifyStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              )}>
                <SelectValue placeholder="选择美化风格..." />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {beautifyStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-green-100 dark:focus:bg-green-700/50",
                      "data-[state=checked]:bg-green-200 dark:data-[state=checked]:bg-green-600/50"
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
        </div>
        <div>
          <Label htmlFor="rawData" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            原始数据：
          </Label>
          <Textarea
            id="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="例如：本月销售额1200万，同比增长15%，用户活跃度85%，客户满意度4.2分..."
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            )}
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="context" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            背景信息（选填）：
          </Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="例如：市场竞争激烈，团队面临人员调整，新产品推广初期..."
            className={cn(
              "w-full min-h-[60px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            )}
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="goals" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            汇报目标（选填）：
          </Label>
          <Textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="例如：争取更多资源支持，展示团队成果，提升个人绩效评价..."
            className={cn(
              "w-full min-h-[60px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            )}
            rows={2}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 数据美化中...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 美化数据</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">美化失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !beautifiedData && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 dark:text-green-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">正在分析数据，赋予其语言魅力...📊</p>
        </div>
      )}

      {beautifiedData && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> 数据美化结果
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{beautifiedData}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DataBeautifier;
