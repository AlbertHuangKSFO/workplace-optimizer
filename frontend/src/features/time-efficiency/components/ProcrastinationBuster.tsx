"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { Loader2, RefreshCw, Terminal, Zap } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ProcrastinationBusterProps {
  locale: ValidLocale;
}

const ProcrastinationBuster = ({ locale }: ProcrastinationBusterProps) => {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [taskDescription, setTaskDescription] = useState("");
  const [taskType, setTaskType] = useState("");
  const [estimatedTime, setEstimatedTime] = useState([2]);
  const [difficultyLevel, setDifficultyLevel] = useState([3]);
  const [procrastinationReason, setProcrastinationReason] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!taskDescription) {
      setError(t('procrastinationBuster.emptyTaskError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);

    const analysisData = {
      taskDescription,
      taskType: taskType || t('procrastinationBuster.taskTypes.other'),
      estimatedTime: estimatedTime[0],
      difficultyLevel: difficultyLevel[0],
      procrastinationReason: procrastinationReason || t('procrastinationBuster.procrastinationReasons.other'),
      urgencyLevel: urgencyLevel || t('procrastinationBuster.urgencyLevels.medium'),
      workStyle: workStyle || t('procrastinationBuster.workStyles.flexible'),
      additionalInfo: additionalInfo || (locale === 'en-US' ? 'None' : '无')
    };

    // Create prompt based on locale
    const prompt = locale === 'en-US'
      ? `Please help me create a procrastination treatment plan. My task information is as follows:

Task Description: ${analysisData.taskDescription}

Task Details:
- Task Type: ${analysisData.taskType}
- Estimated Total Time: ${analysisData.estimatedTime} hours
- Difficulty Level: ${analysisData.difficultyLevel}/5
- Urgency Level: ${analysisData.urgencyLevel}
- Work Style: ${analysisData.workStyle}

Procrastination Analysis:
- Main Procrastination Reason: ${analysisData.procrastinationReason}

Additional Information: ${analysisData.additionalInfo}

Please generate a detailed procrastination treatment plan based on this information, break the task into 5-minute mini-tasks, and provide psychological strategies and execution advice.`
      : `请帮我制定拖延症治疗方案。我的任务信息如下：

任务描述：${analysisData.taskDescription}

任务详情：
- 任务类型：${analysisData.taskType}
- 预估总时长：${analysisData.estimatedTime}小时
- 难度等级：${analysisData.difficultyLevel}/5
- 紧急程度：${analysisData.urgencyLevel}
- 工作风格：${analysisData.workStyle}

拖延分析：
- 主要拖延原因：${analysisData.procrastinationReason}

补充信息：${analysisData.additionalInfo}

请根据这些信息生成详细的拖延症治疗方案，将任务分解成5分钟可完成的小任务，并提供心理策略和执行建议。`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "procrastination-buster",
          locale: locale,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('procrastinationBuster.apiError'));
      }

      const data = await response.json();
      setPlan(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t('procrastinationBuster.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTaskDescription("");
    setTaskType("");
    setEstimatedTime([2]);
    setDifficultyLevel([3]);
    setProcrastinationReason("");
    setUrgencyLevel("");
    setWorkStyle("");
    setAdditionalInfo("");
    setPlan(null);
    setError(null);
  };

  // Show loading if translations are still loading
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="target" className="mr-2 text-4xl">🎯</span>
          {t('procrastinationBuster.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('procrastinationBuster.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Preview */}
        {taskDescription && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">{t('procrastinationBuster.taskOverview')}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{t('procrastinationBuster.estimatedTime')}</div>
                  <div>{estimatedTime[0]}{t('procrastinationBuster.hours')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{t('procrastinationBuster.difficultyLevel')}</div>
                  <div>{"⭐".repeat(difficultyLevel[0])}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{t('procrastinationBuster.taskCount')}</div>
                  <div>{t('procrastinationBuster.about')}{Math.ceil(estimatedTime[0] * 12)}{t('procrastinationBuster.taskCountSuffix')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{t('procrastinationBuster.completionTime')}</div>
                  <div>{t('procrastinationBuster.about')}{Math.ceil(estimatedTime[0] * 1.5)}{t('procrastinationBuster.completionTimeSuffix')}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('procrastinationBuster.tip')}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-description">{t('procrastinationBuster.taskDescriptionRequired')}</Label>
            <Textarea
              id="task-description"
              placeholder={t('procrastinationBuster.taskDescriptionPlaceholder')}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('procrastinationBuster.taskAttributes')}</h3>

              <div className="space-y-2">
                <Label htmlFor="task-type">{t('procrastinationBuster.taskType')}</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('procrastinationBuster.taskTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">{t('procrastinationBuster.taskTypes.work')}</SelectItem>
                    <SelectItem value="study">{t('procrastinationBuster.taskTypes.study')}</SelectItem>
                    <SelectItem value="creative">{t('procrastinationBuster.taskTypes.creative')}</SelectItem>
                    <SelectItem value="life">{t('procrastinationBuster.taskTypes.life')}</SelectItem>
                    <SelectItem value="health">{t('procrastinationBuster.taskTypes.health')}</SelectItem>
                    <SelectItem value="other">{t('procrastinationBuster.taskTypes.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('procrastinationBuster.timeEstimate')} {estimatedTime[0]}{t('procrastinationBuster.hours')}</Label>
                <Slider
                  value={estimatedTime}
                  onValueChange={setEstimatedTime}
                  max={20}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('procrastinationBuster.difficulty')} {difficultyLevel[0]}/5 {"⭐".repeat(difficultyLevel[0])}</Label>
                <Slider
                  value={difficultyLevel}
                  onValueChange={setDifficultyLevel}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('procrastinationBuster.procrastinationAnalysis')}</h3>

              <div className="space-y-2">
                <Label htmlFor="procrastination-reason">{t('procrastinationBuster.procrastinationReason')}</Label>
                <Select value={procrastinationReason} onValueChange={setProcrastinationReason}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('procrastinationBuster.procrastinationReasonPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perfectionism">{t('procrastinationBuster.procrastinationReasons.perfectionism')}</SelectItem>
                    <SelectItem value="fear-failure">{t('procrastinationBuster.procrastinationReasons.fear-failure')}</SelectItem>
                    <SelectItem value="overwhelmed">{t('procrastinationBuster.procrastinationReasons.overwhelmed')}</SelectItem>
                    <SelectItem value="lack-motivation">{t('procrastinationBuster.procrastinationReasons.lack-motivation')}</SelectItem>
                    <SelectItem value="unclear-goals">{t('procrastinationBuster.procrastinationReasons.unclear-goals')}</SelectItem>
                    <SelectItem value="distractions">{t('procrastinationBuster.procrastinationReasons.distractions')}</SelectItem>
                    <SelectItem value="lack-skills">{t('procrastinationBuster.procrastinationReasons.lack-skills')}</SelectItem>
                    <SelectItem value="other">{t('procrastinationBuster.procrastinationReasons.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency-level">{t('procrastinationBuster.urgencyLevel')}</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('procrastinationBuster.urgencyLevelPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('procrastinationBuster.urgencyLevels.low')}</SelectItem>
                    <SelectItem value="medium">{t('procrastinationBuster.urgencyLevels.medium')}</SelectItem>
                    <SelectItem value="high">{t('procrastinationBuster.urgencyLevels.high')}</SelectItem>
                    <SelectItem value="urgent">{t('procrastinationBuster.urgencyLevels.urgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-style">{t('procrastinationBuster.workStyle')}</Label>
                <Select value={workStyle} onValueChange={setWorkStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('procrastinationBuster.workStylePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focused">{t('procrastinationBuster.workStyles.focused')}</SelectItem>
                    <SelectItem value="burst">{t('procrastinationBuster.workStyles.burst')}</SelectItem>
                    <SelectItem value="steady">{t('procrastinationBuster.workStyles.steady')}</SelectItem>
                    <SelectItem value="flexible">{t('procrastinationBuster.workStyles.flexible')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">{t('procrastinationBuster.additionalInfo')}</Label>
            <Textarea
              id="additional-info"
              placeholder={t('procrastinationBuster.additionalInfoPlaceholder')}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleGenerate} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('procrastinationBuster.generating')}
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                {t('procrastinationBuster.generateButton')}
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('procrastinationBuster.resetButton')}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{t('procrastinationBuster.errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {plan && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">{t('procrastinationBuster.treatmentPlan')}</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-purple-600 dark:text-purple-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-green-600 dark:text-green-400" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-base font-semibold my-2 text-orange-600 dark:text-orange-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                  table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 my-4" {...props} />,
                  th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                  // Custom checkbox styles
                  input: ({node, ...props}) => {
                    if (props.type === 'checkbox') {
                      return <input {...props} className="mr-2" />;
                    }
                    return <input {...props} />;
                  },
                }}
              >
                {plan}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProcrastinationBuster;
