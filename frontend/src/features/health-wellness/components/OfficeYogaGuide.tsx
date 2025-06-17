"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from "@/lib/i18n";
import { useTranslations } from "@/lib/use-translations";
import { Loader2, RefreshCw, Sparkles, Terminal } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

interface OfficeYogaGuideProps {
  locale?: ValidLocale;
}

const OfficeYogaGuide = ({ locale = 'zh-CN' }: OfficeYogaGuideProps) => {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [availableTime, setAvailableTime] = useState([15]);
  const [workEnvironment, setWorkEnvironment] = useState("");
  const [bodyIssues, setBodyIssues] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guide, setGuide] = useState<string | null>(null);

  // 使用useMemo来确保选项数组在翻译加载完成后才初始化
  const bodyIssueOptions = React.useMemo(() => [
    { id: "neck-pain", label: t('officeYogaGuide.bodyIssueOptions.neck-pain') },
    { id: "shoulder-tension", label: t('officeYogaGuide.bodyIssueOptions.shoulder-tension') },
    { id: "back-pain", label: t('officeYogaGuide.bodyIssueOptions.back-pain') },
    { id: "eye-strain", label: t('officeYogaGuide.bodyIssueOptions.eye-strain') },
    { id: "wrist-pain", label: t('officeYogaGuide.bodyIssueOptions.wrist-pain') },
    { id: "leg-numbness", label: t('officeYogaGuide.bodyIssueOptions.leg-numbness') },
    { id: "headache", label: t('officeYogaGuide.bodyIssueOptions.headache') },
    { id: "poor-posture", label: t('officeYogaGuide.bodyIssueOptions.poor-posture') }
  ], [t, translationsLoading]);

  const goalOptions = React.useMemo(() => [
    { id: "stress-relief", label: t('officeYogaGuide.goalOptions.stress-relief') },
    { id: "improve-posture", label: t('officeYogaGuide.goalOptions.improve-posture') },
    { id: "increase-energy", label: t('officeYogaGuide.goalOptions.increase-energy') },
    { id: "pain-relief", label: t('officeYogaGuide.goalOptions.pain-relief') },
    { id: "improve-focus", label: t('officeYogaGuide.goalOptions.improve-focus') },
    { id: "better-sleep", label: t('officeYogaGuide.goalOptions.better-sleep') },
    { id: "team-building", label: t('officeYogaGuide.goalOptions.team-building') },
    { id: "daily-routine", label: t('officeYogaGuide.goalOptions.daily-routine') }
  ], [t, translationsLoading]);

  const handleBodyIssueChange = (issueId: string, checked: boolean) => {
    if (checked) {
      setBodyIssues([...bodyIssues, issueId]);
    } else {
      setBodyIssues(bodyIssues.filter(id => id !== issueId));
    }
  };

  const handleGoalChange = (goalId: string, checked: boolean) => {
    if (checked) {
      setGoals([...goals, goalId]);
    } else {
      setGoals(goals.filter(id => id !== goalId));
    }
  };

  const handleGenerate = async () => {
    if (!workEnvironment || !fitnessLevel) {
      setError(t('officeYogaGuide.errorRequired'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGuide(null);

    const selectedBodyIssues = bodyIssueOptions
      .filter(option => bodyIssues.includes(option.id))
      .map(option => option.label);

    const selectedGoals = goalOptions
      .filter(option => goals.includes(option.id))
      .map(option => option.label);

    const analysisData = {
      availableTime: availableTime[0],
      workEnvironment,
      bodyIssues: selectedBodyIssues.length > 0 ? selectedBodyIssues.join("、") : t('officeYogaGuide.noIssues'),
      fitnessLevel,
      workSchedule: workSchedule || t('officeYogaGuide.standardWorkTime'),
      goals: selectedGoals.length > 0 ? selectedGoals.join("、") : t('officeYogaGuide.overallHealthImprovement'),
      additionalInfo: additionalInfo || t('officeYogaGuide.none')
    };

    // Create prompt based on locale
    const prompt = locale === 'en-US'
      ? `Please create an office yoga guide for me. My situation is as follows:

Basic Information:
- Available time: ${analysisData.availableTime} minutes
- Work environment: ${analysisData.workEnvironment}
- Fitness level: ${analysisData.fitnessLevel}
- Work schedule: ${analysisData.workSchedule}

Physical condition:
- Main physical issues: ${analysisData.bodyIssues}

Goals and expectations:
- Desired effects: ${analysisData.goals}

Additional information: ${analysisData.additionalInfo}

Please generate a detailed office yoga guide based on this information, including specific movement instructions, time arrangements, and precautions.`
      : `请为我制定办公室瑜伽指导方案。我的情况如下：

基本信息：
- 可用时间：${analysisData.availableTime}分钟
- 工作环境：${analysisData.workEnvironment}
- 健身水平：${analysisData.fitnessLevel}
- 工作时间安排：${analysisData.workSchedule}

身体状况：
- 主要身体问题：${analysisData.bodyIssues}

目标期望：
- 希望达到的效果：${analysisData.goals}

补充信息：${analysisData.additionalInfo}

请根据这些信息生成详细的办公室瑜伽指导方案，包括具体的动作指导、时间安排和注意事项。`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "office-yoga-guide",
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
        throw new Error(errorData.error || t('officeYogaGuide.errorGeneration'));
      }

      const data = await response.json();
      setGuide(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t('officeYogaGuide.errorUnknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAvailableTime([15]);
    setWorkEnvironment("");
    setBodyIssues([]);
    setFitnessLevel("");
    setWorkSchedule("");
    setGoals([]);
    setAdditionalInfo("");
    setGuide(null);
    setError(null);
  };

  // 如果翻译还在加载，显示加载器
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
          <span role="img" aria-label="yoga" className="mr-2 text-4xl">🧘‍♀️</span>
          {t('officeYogaGuide.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('officeYogaGuide.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 练习预览 */}
        {availableTime[0] > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">🕐 {t('officeYogaGuide.timePreview')}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{t('officeYogaGuide.totalTime')}</div>
                  <div>{availableTime[0]}{t('officeYogaGuide.minutes')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{t('officeYogaGuide.warmup')}</div>
                  <div>{Math.ceil(availableTime[0] * 0.2)}{t('officeYogaGuide.minutes')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{t('officeYogaGuide.mainPractice')}</div>
                  <div>{Math.ceil(availableTime[0] * 0.6)}{t('officeYogaGuide.minutes')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{t('officeYogaGuide.relaxation')}</div>
                  <div>{Math.ceil(availableTime[0] * 0.2)}{t('officeYogaGuide.minutes')}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                💡 {t('officeYogaGuide.timeAllocationTip')}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">⏰ {t('officeYogaGuide.basicSettings')}</h3>

              <div className="space-y-2">
                <Label>{t('officeYogaGuide.availableTime')}：{availableTime[0]}{t('officeYogaGuide.minutes')}</Label>
                <Slider
                  value={availableTime}
                  onValueChange={setAvailableTime}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  {locale === 'en-US'
                    ? "Recommendation: 5-15 minutes for quick relief, 15-30 minutes for standard practice"
                    : "建议：5-15分钟为快速缓解，15-30分钟为标准练习"
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-environment">{t('officeYogaGuide.workEnvironment')} *</Label>
                <Select value={workEnvironment} onValueChange={setWorkEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('officeYogaGuide.selectEnvironment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open-office">{t('officeYogaGuide.environments.open-office')}</SelectItem>
                    <SelectItem value="private-office">{t('officeYogaGuide.environments.private-office')}</SelectItem>
                    <SelectItem value="home-office">{t('officeYogaGuide.environments.home-office')}</SelectItem>
                    <SelectItem value="meeting-room">{t('officeYogaGuide.environments.meeting-room')}</SelectItem>
                    <SelectItem value="shared-space">{t('officeYogaGuide.environments.shared-space')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitness-level">{t('officeYogaGuide.fitnessLevel')} *</Label>
                <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('officeYogaGuide.selectFitnessLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('officeYogaGuide.fitnessLevels.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('officeYogaGuide.fitnessLevels.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('officeYogaGuide.fitnessLevels.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📅 {t('officeYogaGuide.workSchedule')}</h3>

              <div className="space-y-2">
                <Label htmlFor="work-schedule">{t('officeYogaGuide.workSchedule')}</Label>
                <Textarea
                  id="work-schedule"
                  placeholder={t('officeYogaGuide.workSchedulePlaceholder')}
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🩺 {t('officeYogaGuide.bodyIssues')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('officeYogaGuide.selectBodyIssues')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bodyIssueOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={bodyIssues.includes(option.id)}
                    onCheckedChange={(checked) => handleBodyIssueChange(option.id, checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🎯 {t('officeYogaGuide.goals')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('officeYogaGuide.selectGoals')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {goalOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={goals.includes(option.id)}
                    onCheckedChange={(checked) => handleGoalChange(option.id, checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">{t('officeYogaGuide.additionalInfo')}</Label>
            <Textarea
              id="additional-info"
              placeholder={t('officeYogaGuide.additionalInfoPlaceholder')}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleGenerate} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('officeYogaGuide.generating')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('officeYogaGuide.generateGuide')}
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('officeYogaGuide.resetForm')}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{locale === 'en-US' ? 'Error' : '错误'}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {guide && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">
              {locale === 'en-US' ? 'Yoga Guide:' : '瑜伽指导方案:'}
            </h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-blue-600 dark:text-blue-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-purple-600 dark:text-purple-400" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-base font-semibold my-2 text-orange-600 dark:text-orange-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-green-600 dark:text-green-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                  table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 my-4" {...props} />,
                  th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                }}
              >
                {guide}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default OfficeYogaGuide;
