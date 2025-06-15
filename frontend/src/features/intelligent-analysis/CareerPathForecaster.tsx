'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertTriangle, Compass, Loader2, Sparkles } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const experienceLevels = [
  { value: '0', label: '实习生/应届生 (少于1年)' },
  { value: '1-3', label: '初级 (1-3年)' },
  { value: '3-5', label: '中级 (3-5年)' },
  { value: '5-10', label: '高级 (5-10年)' },
  { value: '10+', label: '专家/资深 (10年以上)' },
];

function CareerPathForecaster(): React.JSX.Element {
  const [currentRole, setCurrentRole] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [experience, setExperience] = useState<string>(experienceLevels[1].value); // Default to 1-3 years
  const [aspirations, setAspirations] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');

  const [forecast, setForecast] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentRole.trim() || !skills.trim() || !aspirations.trim()) {
      setError('请填写当前职位/行业、核心技能和职业目标/期望！');
      setForecast('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setForecast('');

    const selectedExperience = experienceLevels.find(e => e.value === experience)?.label || experience;

    const userPrompt = `
我目前的职业信息如下：
- 当前职位/行业：${currentRole}
- 核心技能：${skills}
- 工作年限：${selectedExperience}
- 职业目标/期望：${aspirations}
${preferences.trim() ? `- 工作偏好：${preferences}` : ''}

请基于以上信息，为我分析未来的职业发展路径。请包括：
1.  可能的职业发展方向（2-3个）。
2.  每个方向的关键成功因素和所需技能提升点。
3.  潜在的机遇和挑战。
4.  一些建议和鼓励的话语。
请以富有洞察力且积极的语气进行分析。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'career-path-forecaster', // Placeholder toolId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'AI预测功能暂时不可用，可能是它正在为你看更远的未来。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.assistantMessage) {
        setForecast(data.assistantMessage);
      } else {
        setError('AI返回的预测结果格式有误，可能命运的丝线有点乱。🔮');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '预测职场命运时发生未知错误。请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  }, [currentRole, skills, experience, aspirations, preferences]);

  return (
    <Card className={cn(
      "w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <Compass className="w-10 h-10 text-sky-500 dark:text-sky-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">
          职场命运预测器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          输入你的职业信息，让AI为你分析潜在发展路径、机遇与挑战，洞见未来！
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col space-y-6 px-4 sm:px-0 py-4 min-h-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentRole" className="block text-sm font-medium mb-1">当前职位/行业 <span className="text-red-500">*</span></Label>
            <Textarea
              id="currentRole"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="例如：软件工程师 / 互联网，市场专员 / 快消品"
              className="min-h-[60px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="skills" className="block text-sm font-medium mb-1">核心技能 <span className="text-red-500">*</span></Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="例如：JavaScript, Python, 项目管理, 数据分析, 沟通能力 (请用逗号分隔)"
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="experience" className="block text-sm font-medium mb-1">工作年限 <span className="text-red-500">*</span></Label>
                <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger id="experience">
                    <SelectValue placeholder="选择工作年限..." />
                </SelectTrigger>
                <SelectContent>
                    {experienceLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                        {level.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="aspirations" className="block text-sm font-medium mb-1">职业目标/期望 <span className="text-red-500">*</span></Label>
                <Textarea
                    id="aspirations"
                    value={aspirations}
                    onChange={(e) => setAspirations(e.target.value)}
                    placeholder="例如：成为技术专家，晋升管理层，创业，转换到更有意义的行业"
                    className="min-h-[60px] md:min-h-[calc(theme(spacing.10)+theme(spacing.px)*2+theme(spacing.4))]" // Match select height + label-ish
                    required
                />
            </div>
          </div>
          <div>
            <Label htmlFor="preferences" className="block text-sm font-medium mb-1">工作偏好 (可选)</Label>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="例如：远程工作，弹性时间，注重创新的团队文化，工作生活平衡"
              className="min-h-[80px]"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full !mt-6 text-base py-3">
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在预测您的职业命运...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> 预测我的职场命运</>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 flex items-start flex-shrink-0">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && !forecast && !error && (
          <div className="text-center py-10 flex flex-col items-center justify-center flex-grow">
            <Loader2 className="h-12 w-12 animate-spin text-sky-500 dark:text-sky-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">AI正在连接星象，解读您的职业未来，请稍候...</p>
          </div>
        )}

        {forecast && !isLoading && (
          <div className="mt-6 flex flex-col flex-grow min-h-0">
            <h3 className="text-xl font-semibold mb-3 text-center text-sky-700 dark:text-sky-300 flex-shrink-0">
              <Compass className="inline-block w-6 h-6 mr-2" /> AI的职业洞察：
            </h3>
            <div className="relative p-4 rounded-lg bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto min-h-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{forecast}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CareerPathForecaster;
