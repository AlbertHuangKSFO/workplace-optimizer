"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Terminal, Zap } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const ProcrastinationBuster = () => {
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
      setError("请描述您要完成的任务。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);

    const analysisData = {
      taskDescription,
      taskType: taskType || "其他",
      estimatedTime: estimatedTime[0],
      difficultyLevel: difficultyLevel[0],
      procrastinationReason: procrastinationReason || "未指定",
      urgencyLevel: urgencyLevel || "中等",
      workStyle: workStyle || "未指定",
      additionalInfo: additionalInfo || "无"
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "procrastination-buster",
          messages: [
            {
              role: "user",
              content: `请帮我制定拖延症治疗方案。我的任务信息如下：

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

请根据这些信息生成详细的拖延症治疗方案，将任务分解成5分钟可完成的小任务，并提供心理策略和执行建议。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成拖延症治疗方案时发生错误。");
      }

      const data = await response.json();
      setPlan(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "生成拖延症治疗方案时发生未知错误。");
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="target" className="mr-2 text-4xl">🎯</span>
          拖延症治疗器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          将大任务拆解成5分钟小任务，科学克服拖延症，让执行变得简单
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 任务预览 */}
        {taskDescription && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">📋 任务概览</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">预估时长</div>
                  <div>{estimatedTime[0]}小时</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">难度等级</div>
                  <div>{"⭐".repeat(difficultyLevel[0])}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">分解任务数</div>
                  <div>约{Math.ceil(estimatedTime[0] * 12)}个</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">完成时间</div>
                  <div>约{Math.ceil(estimatedTime[0] * 1.5)}小时</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                💡 包含休息时间的实际完成时间，让您轻松应对任务
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-description">任务描述 *</Label>
            <Textarea
              id="task-description"
              placeholder="详细描述您要完成的任务，例如：写一份市场分析报告、准备演讲稿、整理房间、学习新技能等..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📊 任务属性</h3>

              <div className="space-y-2">
                <Label htmlFor="task-type">任务类型</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">工作任务</SelectItem>
                    <SelectItem value="study">学习任务</SelectItem>
                    <SelectItem value="creative">创意任务</SelectItem>
                    <SelectItem value="life">生活任务</SelectItem>
                    <SelectItem value="health">健康任务</SelectItem>
                    <SelectItem value="other">其他任务</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>预估总时长：{estimatedTime[0]}小时</Label>
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
                <Label>任务难度：{difficultyLevel[0]}/5 {"⭐".repeat(difficultyLevel[0])}</Label>
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
              <h3 className="text-lg font-semibold">🧠 拖延分析</h3>

              <div className="space-y-2">
                <Label htmlFor="procrastination-reason">主要拖延原因</Label>
                <Select value={procrastinationReason} onValueChange={setProcrastinationReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择拖延原因" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perfectionism">完美主义</SelectItem>
                    <SelectItem value="fear-failure">害怕失败</SelectItem>
                    <SelectItem value="overwhelmed">任务过载</SelectItem>
                    <SelectItem value="lack-motivation">缺乏动力</SelectItem>
                    <SelectItem value="unclear-goals">目标不明确</SelectItem>
                    <SelectItem value="distractions">容易分心</SelectItem>
                    <SelectItem value="lack-skills">技能不足</SelectItem>
                    <SelectItem value="other">其他原因</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency-level">紧急程度</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择紧急程度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">不紧急</SelectItem>
                    <SelectItem value="medium">中等紧急</SelectItem>
                    <SelectItem value="high">比较紧急</SelectItem>
                    <SelectItem value="urgent">非常紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-style">工作风格</Label>
                <Select value={workStyle} onValueChange={setWorkStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择您的工作风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focused">专注型（喜欢长时间专注）</SelectItem>
                    <SelectItem value="burst">爆发型（短时间高效）</SelectItem>
                    <SelectItem value="steady">稳定型（匀速推进）</SelectItem>
                    <SelectItem value="flexible">灵活型（根据状态调整）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">补充信息</Label>
            <Textarea
              id="additional-info"
              placeholder="其他想要补充的信息，如特殊要求、时间限制、资源情况等..."
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
                正在生成治疗方案...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                生成拖延症治疗方案
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            重新开始
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

      {plan && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">拖延症治疗方案:</h3>
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
                  // 自定义复选框样式
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
