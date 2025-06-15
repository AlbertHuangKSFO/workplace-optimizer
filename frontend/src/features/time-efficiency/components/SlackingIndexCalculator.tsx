"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Loader2, Terminal, Waves } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const SlackingIndexCalculator = () => {
  const [workHours, setWorkHours] = useState([8]);
  const [actualWorkHours, setActualWorkHours] = useState([6]);
  const [slackingFrequency, setSlackingFrequency] = useState("");
  const [slackingDuration, setSlackingDuration] = useState([30]);
  const [slackingActivities, setSlackingActivities] = useState("");
  const [workEfficiency, setWorkEfficiency] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!slackingFrequency || !workEfficiency || !riskLevel) {
      setError("请填写所有必填项。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      workHours: workHours[0],
      actualWorkHours: actualWorkHours[0],
      slackingFrequency,
      slackingDuration: slackingDuration[0],
      slackingActivities: slackingActivities || "未指定",
      workEfficiency,
      riskLevel,
      additionalInfo: additionalInfo || "无"
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "slacking-index-calculator",
          messages: [
            {
              role: "user",
              content: `请帮我计算划水指数。我的工作数据如下：

工作时间安排：
- 每日上班时间：${analysisData.workHours}小时
- 实际工作时间：${analysisData.actualWorkHours}小时

摸鱼行为分析：
- 摸鱼频率：${analysisData.slackingFrequency}
- 每次摸鱼时长：约${analysisData.slackingDuration}分钟
- 主要摸鱼活动：${analysisData.slackingActivities}

工作表现：
- 工作效率：${analysisData.workEfficiency}
- 被发现风险：${analysisData.riskLevel}

补充信息：${analysisData.additionalInfo}

请根据这些信息计算我的划水指数并提供详细分析。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "计算划水指数时发生错误。");
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "计算划水指数时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setWorkHours([8]);
    setActualWorkHours([6]);
    setSlackingFrequency("");
    setSlackingDuration([30]);
    setSlackingActivities("");
    setWorkEfficiency("");
    setRiskLevel("");
    setAdditionalInfo("");
    setReport(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="swimming" className="mr-2 text-4xl">🏊‍♂️</span>
          划水指数计算器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          科学量化您的摸鱼程度，让划水变得更有艺术感
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 工作时间设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⏰ 工作时间</h3>

            <div className="space-y-2">
              <Label>每日上班时间：{workHours[0]}小时</Label>
              <Slider
                value={workHours}
                onValueChange={setWorkHours}
                max={12}
                min={4}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>实际工作时间：{actualWorkHours[0]}小时</Label>
              <Slider
                value={actualWorkHours}
                onValueChange={setActualWorkHours}
                max={workHours[0]}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          {/* 摸鱼行为 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🎣 摸鱼行为</h3>

            <div className="space-y-2">
              <Label htmlFor="slacking-frequency">摸鱼频率 *</Label>
              <Select value={slackingFrequency} onValueChange={setSlackingFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="选择摸鱼频率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rarely">很少（一周1-2次）</SelectItem>
                  <SelectItem value="occasionally">偶尔（每天1-2次）</SelectItem>
                  <SelectItem value="frequently">经常（每天3-5次）</SelectItem>
                  <SelectItem value="constantly">频繁（每天5次以上）</SelectItem>
                  <SelectItem value="professional">专业级（几乎一直在摸鱼）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>每次摸鱼时长：{slackingDuration[0]}分钟</Label>
              <Slider
                value={slackingDuration}
                onValueChange={setSlackingDuration}
                max={120}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slacking-activities">主要摸鱼活动</Label>
            <Textarea
              id="slacking-activities"
              placeholder="例如：刷微博、看视频、聊天、网购、玩游戏、看小说等"
              value={slackingActivities}
              onChange={(e) => setSlackingActivities(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-efficiency">工作效率 *</Label>
              <Select value={workEfficiency} onValueChange={setWorkEfficiency}>
                <SelectTrigger>
                  <SelectValue placeholder="评估您的工作效率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-high">非常高（总能提前完成任务）</SelectItem>
                  <SelectItem value="high">较高（按时完成任务）</SelectItem>
                  <SelectItem value="medium">一般（偶尔延期）</SelectItem>
                  <SelectItem value="low">较低（经常延期）</SelectItem>
                  <SelectItem value="very-low">很低（任务堆积如山）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-level">被发现风险 *</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="评估被发现的风险" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-low">很低（摸鱼技巧高超）</SelectItem>
                  <SelectItem value="low">较低（比较谨慎）</SelectItem>
                  <SelectItem value="medium">一般（偶尔被发现）</SelectItem>
                  <SelectItem value="high">较高（经常被发现）</SelectItem>
                  <SelectItem value="very-high">很高（明目张胆摸鱼）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">补充信息</Label>
            <Textarea
              id="additional-info"
              placeholder="其他想要补充的工作或摸鱼相关信息..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCalculate} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在计算划水指数...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                计算划水指数
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <Waves className="mr-2 h-4 w-4" />
            重新评估
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

      {report && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">划水指数报告:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-purple-600 dark:text-purple-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-green-600 dark:text-green-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SlackingIndexCalculator;
