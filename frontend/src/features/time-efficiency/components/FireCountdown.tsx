"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Loader2, RefreshCw, Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const FireCountdown = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpense, setMonthlyExpense] = useState("");
  const [currentAssets, setCurrentAssets] = useState("");
  const [expectedReturn, setExpectedReturn] = useState([7]);
  const [inflationRate, setInflationRate] = useState([3]);
  const [fireStrategy, setFireStrategy] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  // 计算基础财务数据
  const calculateBasicData = () => {
    if (!monthlyIncome || !monthlyExpense) return null;

    const income = parseFloat(monthlyIncome);
    const expense = parseFloat(monthlyExpense);
    const assets = parseFloat(currentAssets) || 0;

    const monthlySavings = income - expense;
    const savingsRate = (monthlySavings / income) * 100;
    const yearlyExpense = expense * 12;

    // 财务自由目标金额
    const conservativeTarget = yearlyExpense * 30; // 30倍
    const standardTarget = yearlyExpense * 25;     // 25倍
    const aggressiveTarget = yearlyExpense * 20;   // 20倍

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      monthlySavings,
      savingsRate,
      yearlyExpense,
      currentAssets: assets,
      conservativeTarget,
      standardTarget,
      aggressiveTarget
    };
  };

  // 计算达到财务自由的时间（简化版复利计算）
  const calculateTimeToFire = (targetAmount: number, currentAssets: number, monthlySavings: number, annualReturn: number) => {
    if (monthlySavings <= 0) return "无法实现";

    const monthlyReturn = annualReturn / 12 / 100;
    const yearlySavings = monthlySavings * 12;

    // 使用复利公式计算
    let years = 0;
    let currentValue = currentAssets;

    while (currentValue < targetAmount && years < 100) {
      currentValue = currentValue * (1 + annualReturn / 100) + yearlySavings;
      years++;
    }

    return years >= 100 ? "超过100年" : `${years}年`;
  };

  const basicData = calculateBasicData();

  const handleCalculate = async () => {
    if (!monthlyIncome || !monthlyExpense) {
      setError("请填写月收入和月支出。");
      return;
    }

    if (parseFloat(monthlyIncome) <= parseFloat(monthlyExpense)) {
      setError("月收入必须大于月支出才能实现财务自由。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      ...basicData,
      expectedReturn: expectedReturn[0],
      inflationRate: inflationRate[0],
      fireStrategy: fireStrategy || "标准版",
      city: city || "未指定",
      age: age || "未指定",
      additionalInfo: additionalInfo || "无"
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "fire-countdown",
          messages: [
            {
              role: "user",
              content: `请帮我计算财务自由倒计时。我的财务信息如下：

基本信息：
- 年龄：${analysisData.age}
- 所在城市：${analysisData.city}
- 财务自由策略：${analysisData.fireStrategy}

收支情况：
- 月收入：¥${analysisData.monthlyIncome}
- 月支出：¥${analysisData.monthlyExpense}
- 月净储蓄：¥${analysisData.monthlySavings?.toFixed(2)}
- 储蓄率：${analysisData.savingsRate?.toFixed(1)}%
- 年支出：¥${analysisData.yearlyExpense}

资产状况：
- 当前资产：¥${analysisData.currentAssets}

投资预期：
- 预期年化收益率：${analysisData.expectedReturn}%
- 预期通胀率：${analysisData.inflationRate}%

财务自由目标：
- 保守版（30倍）：¥${analysisData.conservativeTarget?.toFixed(0)}
- 标准版（25倍）：¥${analysisData.standardTarget?.toFixed(0)}
- 激进版（20倍）：¥${analysisData.aggressiveTarget?.toFixed(0)}

补充信息：${analysisData.additionalInfo}

请根据这些信息生成详细的财务自由倒计时分析报告，包括时间预测、风险分析、优化建议和行动计划。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "计算财务自由倒计时时发生错误。");
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "计算财务自由倒计时时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMonthlyIncome("");
    setMonthlyExpense("");
    setCurrentAssets("");
    setExpectedReturn([7]);
    setInflationRate([3]);
    setFireStrategy("");
    setCity("");
    setAge("");
    setAdditionalInfo("");
    setReport(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="fire" className="mr-2 text-4xl">🔥</span>
          财务自由倒计时
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          按当前储蓄速度计算何时实现财务自由，让梦想有个明确的时间表
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 财务预览 */}
        {basicData && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">🎯 财务自由目标预览</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-blue-600">🛡️ 保守版</div>
                  <div className="text-lg font-bold">¥{(basicData.conservativeTarget / 10000).toFixed(0)}万</div>
                  <div className="text-xs text-gray-500">年支出的30倍</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-green-600">📈 标准版</div>
                  <div className="text-lg font-bold">¥{(basicData.standardTarget / 10000).toFixed(0)}万</div>
                  <div className="text-xs text-gray-500">年支出的25倍</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-red-600">🚀 激进版</div>
                  <div className="text-lg font-bold">¥{(basicData.aggressiveTarget / 10000).toFixed(0)}万</div>
                  <div className="text-xs text-gray-500">年支出的20倍</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">月储蓄</div>
                  <div>¥{basicData.monthlySavings.toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">储蓄率</div>
                  <div>{basicData.savingsRate.toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">年支出</div>
                  <div>¥{(basicData.yearlyExpense / 10000).toFixed(1)}万</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">当前资产</div>
                  <div>¥{(basicData.currentAssets / 10000).toFixed(1)}万</div>
                </div>
              </div>

              {expectedReturn.length > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">⏰ 预计实现时间（{expectedReturn[0]}%年化收益）</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>保守版: {calculateTimeToFire(basicData.conservativeTarget, basicData.currentAssets, basicData.monthlySavings, expectedReturn[0])}</div>
                    <div>标准版: {calculateTimeToFire(basicData.standardTarget, basicData.currentAssets, basicData.monthlySavings, expectedReturn[0])}</div>
                    <div>激进版: {calculateTimeToFire(basicData.aggressiveTarget, basicData.currentAssets, basicData.monthlySavings, expectedReturn[0])}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 收支信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">💰 收支信息</h3>

            <div className="space-y-2">
              <Label htmlFor="monthly-income">月收入 *</Label>
              <Input
                id="monthly-income"
                type="number"
                placeholder="请输入月收入"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-expense">月支出 *</Label>
              <Input
                id="monthly-expense"
                type="number"
                placeholder="请输入月支出"
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-assets">当前资产</Label>
              <Input
                id="current-assets"
                type="number"
                placeholder="包括存款、投资等总资产"
                value={currentAssets}
                onChange={(e) => setCurrentAssets(e.target.value)}
              />
            </div>
          </div>

          {/* 个人信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">👤 个人信息</h3>

            <div className="space-y-2">
              <Label htmlFor="age">年龄</Label>
              <Input
                id="age"
                type="number"
                placeholder="您的年龄"
                value={age}
                onChange={(e) => setAge(e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="fire-strategy">财务自由策略</Label>
              <Select value={fireStrategy} onValueChange={setFireStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="选择您的策略" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">保守版（30倍年支出）</SelectItem>
                  <SelectItem value="standard">标准版（25倍年支出）</SelectItem>
                  <SelectItem value="aggressive">激进版（20倍年支出）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>预期年化收益率：{expectedReturn[0]}%</Label>
              <Slider
                value={expectedReturn}
                onValueChange={setExpectedReturn}
                max={15}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">建议：3-7%为保守，8-12%为中等，13%+为激进</div>
            </div>

            <div className="space-y-2">
              <Label>预期通胀率：{inflationRate[0]}%</Label>
              <Slider
                value={inflationRate}
                onValueChange={setInflationRate}
                max={8}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">历史平均通胀率约为3%</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">补充信息</Label>
            <Textarea
              id="additional-info"
              placeholder="其他想要补充的财务规划信息，如投资偏好、风险承受能力、特殊支出计划等..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCalculate} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在计算财务自由时间...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                计算财务自由倒计时
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            重新规划
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
            <h3 className="text-lg font-semibold">财务自由分析报告:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-red-600 dark:text-red-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-blue-600 dark:text-blue-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-orange-600 dark:text-orange-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                  table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 my-4" {...props} />,
                  th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
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

export default FireCountdown;
