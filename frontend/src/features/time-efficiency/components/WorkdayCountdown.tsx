"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Clock, Loader2, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const WorkdayCountdown = () => {
  const [countdownType, setCountdownType] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customEvent, setCustomEvent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownData | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  // 实时倒计时更新
  useEffect(() => {
    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const getPresetTargetDate = (type: string): Date | null => {
    const now = new Date();

    switch (type) {
      case "end-of-workday":
        const endOfDay = new Date(now);
        endOfDay.setHours(18, 0, 0, 0); // 假设6点下班
        if (endOfDay <= now) {
          endOfDay.setDate(endOfDay.getDate() + 1);
        }
        return endOfDay;

      case "weekend":
        const weekend = new Date(now);
        const daysUntilWeekend = 6 - now.getDay(); // 6 = Saturday
        weekend.setDate(now.getDate() + (daysUntilWeekend === 0 ? 7 : daysUntilWeekend));
        weekend.setHours(0, 0, 0, 0);
        return weekend;

      case "payday":
        const payday = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 下个月1号
        return payday;

      case "spring-festival":
        const springFestival = new Date(now.getFullYear() + 1, 0, 29); // 假设春节是1月29日
        if (now.getMonth() >= 1) { // 如果已经过了春节
          springFestival.setFullYear(now.getFullYear() + 1);
        }
        return springFestival;

      default:
        return null;
    }
  };

  const handleStartCountdown = async () => {
    let target: Date | null = null;
    let eventName = "";

    if (countdownType === "custom") {
      if (!customDate || !customTime || !customEvent) {
        setError("请填写完整的自定义倒计时信息。");
        return;
      }
      target = new Date(`${customDate}T${customTime}`);
      eventName = customEvent;
    } else {
      target = getPresetTargetDate(countdownType);
      switch (countdownType) {
        case "end-of-workday":
          eventName = "下班";
          break;
        case "weekend":
          eventName = "周末";
          break;
        case "payday":
          eventName = "发薪日";
          break;
        case "spring-festival":
          eventName = "春节";
          break;
        default:
          eventName = "目标时间";
      }
    }

    if (!target) {
      setError("请选择倒计时类型。");
      return;
    }

    if (target <= new Date()) {
      setError("目标时间必须在未来。");
      return;
    }

    setTargetDate(target);
    setError(null);

    // 获取AI建议
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "workday-countdown",
          messages: [
            {
              role: "user",
              content: `我想要一个倒计时到"${eventName}"的激励建议。目标时间是：${target.toLocaleString('zh-CN')}，当前时间是：${new Date().toLocaleString('zh-CN')}。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取建议时发生错误。");
      }

      const data = await response.json();
      setAiAdvice(data.assistantMessage);
    } catch (err: any) {
      console.error("获取AI建议失败:", err.message);
      // 不显示错误，只是没有AI建议
    } finally {
      setIsLoading(false);
    }
  };

  const resetCountdown = () => {
    setTargetDate(null);
    setCountdown(null);
    setAiAdvice(null);
    setCountdownType("");
    setCustomDate("");
    setCustomTime("");
    setCustomEvent("");
    setError(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="countdown" className="mr-2 text-4xl">⏰</span>
          工作日倒计时
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          看看距离下班/周末/假期还有多久，让等待变得有盼头
        </CardDescription>
      </CardHeader>

      {!targetDate ? (
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="countdown-type">倒计时类型</Label>
            <Select value={countdownType} onValueChange={setCountdownType}>
              <SelectTrigger>
                <SelectValue placeholder="选择倒计时类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="end-of-workday">今日下班</SelectItem>
                <SelectItem value="weekend">本周末</SelectItem>
                <SelectItem value="payday">发薪日</SelectItem>
                <SelectItem value="spring-festival">春节</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {countdownType === "custom" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-date">目标日期</Label>
                  <Input
                    id="custom-date"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-time">目标时间</Label>
                  <Input
                    id="custom-time"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-event">事件名称</Label>
                <Input
                  id="custom-event"
                  placeholder="例如：年假开始、项目截止、生日等"
                  value={customEvent}
                  onChange={(e) => setCustomEvent(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button onClick={handleStartCountdown} disabled={!countdownType} className="w-full">
            <CalendarClock className="mr-2 h-4 w-4" />
            开始倒计时
          </Button>

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      ) : (
        <CardContent className="space-y-6">
          {countdown && (
            <div className="text-center space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {countdown.days}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">天</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {countdown.hours}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">小时</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {countdown.minutes}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">分钟</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {countdown.seconds}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">秒</div>
                </div>
              </div>

              {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && (
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  🎉 时间到了！
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={resetCountdown} variant="outline" className="flex-1">
              重新设置
            </Button>
            <Button onClick={handleStartCountdown} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  获取建议中...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  刷新建议
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}

      {aiAdvice && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">AI 激励建议:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-64 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-semibold my-2 text-purple-600 dark:text-purple-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-semibold my-2 text-green-600 dark:text-green-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                }}
              >
                {aiAdvice}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default WorkdayCountdown;
