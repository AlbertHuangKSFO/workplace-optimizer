"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Sparkles, Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const OfficeYogaGuide = () => {
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

  const bodyIssueOptions = [
    { id: "neck-pain", label: "颈部疼痛/僵硬" },
    { id: "shoulder-tension", label: "肩膀紧张" },
    { id: "back-pain", label: "腰背疼痛" },
    { id: "eye-strain", label: "眼部疲劳" },
    { id: "wrist-pain", label: "手腕疼痛" },
    { id: "leg-numbness", label: "腿部麻木" },
    { id: "headache", label: "头痛" },
    { id: "poor-posture", label: "姿势不良" }
  ];

  const goalOptions = [
    { id: "stress-relief", label: "缓解压力" },
    { id: "improve-posture", label: "改善姿势" },
    { id: "increase-energy", label: "提升精力" },
    { id: "pain-relief", label: "缓解疼痛" },
    { id: "improve-focus", label: "提高专注力" },
    { id: "better-sleep", label: "改善睡眠" },
    { id: "team-building", label: "团队建设" },
    { id: "daily-routine", label: "建立日常习惯" }
  ];

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
      setError("请填写工作环境和健身水平。");
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
      bodyIssues: selectedBodyIssues.length > 0 ? selectedBodyIssues.join("、") : "无特殊问题",
      fitnessLevel,
      workSchedule: workSchedule || "标准工作时间",
      goals: selectedGoals.length > 0 ? selectedGoals.join("、") : "整体健康改善",
      additionalInfo: additionalInfo || "无"
    };

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
              content: `请为我制定办公室瑜伽指导方案。我的情况如下：

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

请根据这些信息生成详细的办公室瑜伽指导方案，包括具体的动作指导、时间安排和注意事项。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成瑜伽指导方案时发生错误。");
      }

      const data = await response.json();
      setGuide(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "生成瑜伽指导方案时发生未知错误。");
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="yoga" className="mr-2 text-4xl">🧘‍♀️</span>
          办公室瑜伽指导
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          适合在工位进行的拉伸和放松动作，缓解身体疲劳，提升工作状态
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 练习预览 */}
        {availableTime[0] > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">🕐 练习时间规划</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">总时长</div>
                  <div>{availableTime[0]}分钟</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">热身</div>
                  <div>{Math.ceil(availableTime[0] * 0.2)}分钟</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">主练习</div>
                  <div>{Math.ceil(availableTime[0] * 0.6)}分钟</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">放松</div>
                  <div>{Math.ceil(availableTime[0] * 0.2)}分钟</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                💡 科学的时间分配，让您在有限时间内获得最佳效果
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">⏰ 基本设置</h3>

              <div className="space-y-2">
                <Label>可用时间：{availableTime[0]}分钟</Label>
                <Slider
                  value={availableTime}
                  onValueChange={setAvailableTime}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">建议：5-15分钟为快速缓解，15-30分钟为标准练习</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-environment">工作环境 *</Label>
                <Select value={workEnvironment} onValueChange={setWorkEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择您的工作环境" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open-office">开放式办公区</SelectItem>
                    <SelectItem value="private-office">独立办公室</SelectItem>
                    <SelectItem value="cubicle">格子间</SelectItem>
                    <SelectItem value="home-office">居家办公</SelectItem>
                    <SelectItem value="shared-space">共享办公空间</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitness-level">健身水平 *</Label>
                <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择您的健身水平" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初学者（很少运动）</SelectItem>
                    <SelectItem value="intermediate">中等水平（偶尔运动）</SelectItem>
                    <SelectItem value="advanced">较高水平（经常运动）</SelectItem>
                    <SelectItem value="expert">专业水平（瑜伽经验丰富）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📅 工作安排</h3>

              <div className="space-y-2">
                <Label htmlFor="work-schedule">工作时间安排</Label>
                <Select value={workSchedule} onValueChange={setWorkSchedule}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择您的工作时间" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准工作时间（9-18点）</SelectItem>
                    <SelectItem value="flexible">弹性工作时间</SelectItem>
                    <SelectItem value="shift">轮班工作</SelectItem>
                    <SelectItem value="overtime">经常加班</SelectItem>
                    <SelectItem value="remote">远程工作</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🩺 身体状况评估</h3>
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
            <h3 className="text-lg font-semibold">🎯 目标设定</h3>
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
            <Label htmlFor="additional-info">补充信息</Label>
            <Textarea
              id="additional-info"
              placeholder="其他想要补充的信息，如特殊身体状况、练习偏好、时间限制等..."
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
                正在生成瑜伽指导...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成个性化瑜伽方案
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            重新设置
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {guide && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">瑜伽指导方案:</h3>
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
