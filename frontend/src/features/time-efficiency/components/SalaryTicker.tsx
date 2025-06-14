"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Loader2, Play, Square, Terminal, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const SalaryTicker = () => {
  const [salaryType, setSalaryType] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [workHoursPerDay, setWorkHoursPerDay] = useState("8");
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState("5");
  const [city, setCity] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [isTickerRunning, setIsTickerRunning] = useState(false);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 计算基础数据
  const calculateBasicData = () => {
    if (!salaryAmount || !salaryType) return null;

    const amount = parseFloat(salaryAmount);
    const hoursPerDay = parseFloat(workHoursPerDay);
    const daysPerWeek = parseFloat(workDaysPerWeek);

    let yearlyIncome = 0;
    if (salaryType === 'yearly') {
      yearlyIncome = amount;
    } else if (salaryType === 'monthly') {
      yearlyIncome = amount * 12;
    }

    const workDaysPerYear = daysPerWeek * 52; // 52周
    const workHoursPerYear = workDaysPerYear * hoursPerDay;

    const hourlyRate = yearlyIncome / workHoursPerYear;
    const minuteRate = hourlyRate / 60;
    const secondRate = minuteRate / 60;

    return {
      yearlyIncome,
      monthlyIncome: yearlyIncome / 12,
      dailyIncome: yearlyIncome / workDaysPerYear,
      hourlyRate,
      minuteRate,
      secondRate
    };
  };

  const basicData = calculateBasicData();

  // 实时计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTickerRunning && basicData && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
        const earnings = elapsedSeconds * basicData.secondRate;
        setCurrentEarnings(earnings);
      }, 100); // 每100ms更新一次
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTickerRunning, basicData, startTime]);

  const startTicker = () => {
    setStartTime(new Date());
    setCurrentEarnings(0);
    setIsTickerRunning(true);
  };

  const stopTicker = () => {
    setIsTickerRunning(false);
  };

  const handleAnalyze = async () => {
    if (!salaryAmount || !salaryType) {
      setError("请填写薪资信息。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      salaryType,
      salaryAmount: parseFloat(salaryAmount),
      workHoursPerDay: parseFloat(workHoursPerDay),
      workDaysPerWeek: parseFloat(workDaysPerWeek),
      city: city || "未指定",
      additionalInfo: additionalInfo || "无",
      ...basicData
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "salary-ticker",
          messages: [
            {
              role: "user",
              content: `请帮我分析工资时间价值。我的薪资信息如下：

薪资信息：
- 薪资类型：${analysisData.salaryType === 'yearly' ? '年薪' : '月薪'}
- 薪资金额：¥${analysisData.salaryAmount}
- 每日工作时间：${analysisData.workHoursPerDay}小时
- 每周工作天数：${analysisData.workDaysPerWeek}天
- 所在城市：${analysisData.city}

计算结果：
- 年收入：¥${analysisData.yearlyIncome?.toFixed(2)}
- 月收入：¥${analysisData.monthlyIncome?.toFixed(2)}
- 日收入：¥${analysisData.dailyIncome?.toFixed(2)}
- 时薪：¥${analysisData.hourlyRate?.toFixed(2)}
- 分薪：¥${analysisData.minuteRate?.toFixed(4)}
- 秒薪：¥${analysisData.secondRate?.toFixed(6)}

补充信息：${analysisData.additionalInfo}

请根据这些信息生成详细的工资倒推分析报告，包括时间成本对比、工作效率分析和时间管理建议。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "分析工资时间价值时发生错误。");
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "分析工资时间价值时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSalaryType("");
    setSalaryAmount("");
    setWorkHoursPerDay("8");
    setWorkDaysPerWeek("5");
    setCity("");
    setAdditionalInfo("");
    setReport(null);
    setError(null);
    setIsTickerRunning(false);
    setCurrentEarnings(0);
    setStartTime(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="money" className="mr-2 text-4xl">💰</span>
          工资倒推计算器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          实时显示"这分钟您赚了多少钱"，让时间变得更有价值感
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 实时收入显示 */}
        {basicData && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">💸 实时收入计时器</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">时薪</div>
                  <div>¥{basicData.hourlyRate.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">分薪</div>
                  <div>¥{basicData.minuteRate.toFixed(4)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">秒薪</div>
                  <div>¥{basicData.secondRate.toFixed(6)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">日薪</div>
                  <div>¥{basicData.dailyIncome.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  当前已赚: ¥{currentEarnings.toFixed(4)}
                </div>
                <div className="flex justify-center gap-2">
                  {!isTickerRunning ? (
                    <Button onClick={startTicker} className="bg-green-600 hover:bg-green-700">
                      <Play className="mr-2 h-4 w-4" />
                      开始计时
                    </Button>
                  ) : (
                    <Button onClick={stopTicker} variant="destructive">
                      <Square className="mr-2 h-4 w-4" />
                      停止计时
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 薪资信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">💼 薪资信息</h3>

            <div className="space-y-2">
              <Label htmlFor="salary-type">薪资类型 *</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择薪资类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">月薪</SelectItem>
                  <SelectItem value="yearly">年薪</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary-amount">薪资金额 *</Label>
              <Input
                id="salary-amount"
                type="number"
                placeholder="请输入薪资金额"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">所在城市</Label>
              <Input
                id="city"
                placeholder="例如：北京、上海、深圳等"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* 工作时间 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⏰ 工作时间</h3>

            <div className="space-y-2">
              <Label htmlFor="work-hours">每日工作时间（小时）</Label>
              <Input
                id="work-hours"
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={workHoursPerDay}
                onChange={(e) => setWorkHoursPerDay(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work-days">每周工作天数</Label>
              <Input
                id="work-days"
                type="number"
                step="0.5"
                min="1"
                max="7"
                value={workDaysPerWeek}
                onChange={(e) => setWorkDaysPerWeek(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-info">补充信息</Label>
              <Textarea
                id="additional-info"
                placeholder="其他想要补充的薪资或工作相关信息..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleAnalyze} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在分析时间价值...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                分析时间价值
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            重新计算
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
            <h3 className="text-lg font-semibold">时间价值分析报告:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-blue-600 dark:text-blue-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-purple-600 dark:text-purple-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-green-600 dark:text-green-400" {...props} />,
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

export default SalaryTicker;
