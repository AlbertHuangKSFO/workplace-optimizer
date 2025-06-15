'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input'; // Added Input for current job
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertTriangle, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react'; // Using Lightbulb or TrendingUp
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const timeCommitmentOptions = [
  { value: '0-5', label: '每周 0-5 小时' },
  { value: '5-10', label: '每周 5-10 小时' },
  { value: '10-15', label: '每周 10-15 小时' },
  { value: '15-20', label: '每周 15-20 小时' },
  { value: '20+', label: '每周 20+ 小时' },
];

function SideHustleAssessor(): React.JSX.Element {
  const [currentJob, setCurrentJob] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [availableTime, setAvailableTime] = useState<string>(timeCommitmentOptions[1].value); // Default to 5-10 hours
  const [expectations, setExpectations] = useState<string>('');

  const [assessment, setAssessment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentJob.trim() || !skills.trim() || !interests.trim()) {
      setError('请至少填写当前主业、您的技能和兴趣爱好！');
      setAssessment('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssessment('');

    const selectedTime = timeCommitmentOptions.find(t => t.value === availableTime)?.label || availableTime;

    const userPrompt = `
请帮我评估我的副业潜力。我的信息如下：
- 当前主业/行业：${currentJob}
- 我的技能 (工作内外均可)：${skills}
- 我的兴趣爱好：${interests}
- 每周可用于副业的时间：${selectedTime}
${expectations.trim() ? `- 我对副业的期望：${expectations}` : ''}

请基于以上信息，为我分析我的副业潜力。请包括：
1.  基于我的技能和兴趣，建议2-3个具体的副业方向。
2.  分析每个方向的潜在优势、可能遇到的挑战以及预期的收入潜力（粗略估计，如低/中/高）。
3.  根据我可投入的时间，评估这些副业方向的现实可行性。
4.  如果我认为某个方向可行，给出1-2条初步的行动建议或资源提示。
请以鼓励和务实的语气进行分析。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'side-hustle-assessor', // Placeholder toolId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'AI评估功能暂时打盹中，可能在思考如何让你暴富。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.assistantMessage) {
        setAssessment(data.assistantMessage);
      } else {
        setError('AI返回的评估结果似乎有点"神秘"，请稍后再试。✨');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '评估副业潜力时发生未知错误，财富密码可能藏得比较深。');
    } finally {
      setIsLoading(false);
    }
  }, [currentJob, skills, interests, availableTime, expectations]);

  return (
    <Card className={cn(
      "w-full max-w-9xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <Lightbulb className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          副业潜力评估器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          发掘你的隐藏技能和赚钱新机会，让AI为你点亮第二事业的明灯！
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-0 py-4 flex-shrink-0">
        <div>
          <Label htmlFor="currentJob" className="block text-sm font-medium mb-1">当前主业/行业 <span className="text-red-500">*</span></Label>
          <Input
            id="currentJob"
            type="text"
            value={currentJob}
            onChange={(e) => setCurrentJob(e.target.value)}
            placeholder="例如：市场营销经理 / 互联网行业"
            required
          />
        </div>
        <div>
          <Label htmlFor="skills" className="block text-sm font-medium mb-1">我的技能 (工作内外均可) <span className="text-red-500">*</span></Label>
          <Textarea
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="例如：写作, 编程 (Python, JS), 设计 (Photoshop), 视频剪辑, 演讲, 外语 (英语六级), 烘焙, 手工艺..."
            className="min-h-[100px]"
            required
          />
        </div>
        <div>
          <Label htmlFor="interests" className="block text-sm font-medium mb-1">我的兴趣爱好 <span className="text-red-500">*</span></Label>
          <Textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="例如：阅读, 旅游, 健身, 玩游戏, 摄影, 烹饪, 养宠物, 看电影, 听音乐..."
            className="min-h-[100px]"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="availableTime" className="block text-sm font-medium mb-1">每周可用于副业的时间 <span className="text-red-500">*</span></Label>
                <Select value={availableTime} onValueChange={setAvailableTime}>
                <SelectTrigger id="availableTime">
                    <SelectValue placeholder="选择可投入时间..." />
                </SelectTrigger>
                <SelectContent>
                    {timeCommitmentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="expectations" className="block text-sm font-medium mb-1">我对副业的期望 (选填)</Label>
                <Textarea
                    id="expectations"
                    value={expectations}
                    onChange={(e) => setExpectations(e.target.value)}
                    placeholder="例如：赚点零花钱, 探索新领域, 发展成主业, 帮助他人..."
                    className="min-h-[60px] md:min-h-[calc(theme(spacing.10)+theme(spacing.px)*2+theme(spacing.4))]"
                />
            </div>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full !mt-6 text-base py-3">
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在评估您的副业潜力...</>
          ) : (
            <><TrendingUp className="mr-2 h-5 w-5" /> 评估我的副业潜力</>
          )}
        </Button>
      </form>

      <CardContent className="flex-grow flex flex-col space-y-6 px-4 sm:px-0 py-4 min-h-0">
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 flex items-start flex-shrink-0">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && !assessment && !error && (
          <div className="text-center py-10 flex flex-col items-center justify-center flex-grow">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 dark:text-yellow-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">AI正在分析您的技能与兴趣，匹配最佳副业机会...</p>
          </div>
        )}

        {assessment && !isLoading && (
          <div className="mt-6 flex flex-col flex-grow min-h-0">
            <h3 className="text-xl font-semibold mb-3 text-center text-yellow-700 dark:text-yellow-300 flex-shrink-0">
              <Sparkles className="inline-block w-6 h-6 mr-2" /> AI的副业洞察：
            </h3>
            <div className="relative p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto min-h-[450px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{assessment}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SideHustleAssessor;
