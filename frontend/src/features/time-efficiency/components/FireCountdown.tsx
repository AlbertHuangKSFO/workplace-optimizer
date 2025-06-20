"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { Calculator, Loader2, RefreshCw, Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface FireCountdownProps {
  locale: ValidLocale;
}

const FireCountdown = ({ locale }: FireCountdownProps) => {
  const { t, loading: translationsLoading } = useTranslations(locale);

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
    if (monthlySavings <= 0) return t('fireCountdown.cannotAchieve');

    const monthlyReturn = annualReturn / 12 / 100;
    const yearlySavings = monthlySavings * 12;

    // 使用复利公式计算
    let years = 0;
    let currentValue = currentAssets;

    while (currentValue < targetAmount && years < 100) {
      currentValue = currentValue * (1 + annualReturn / 100) + yearlySavings;
      years++;
    }

    return years >= 100 ? t('fireCountdown.overHundredYears') : `${years}${t('fireCountdown.years')}`;
  };

  const basicData = calculateBasicData();

  const handleCalculate = async () => {
    if (!monthlyIncome || !monthlyExpense) {
      setError(t('fireCountdown.emptyIncomeExpenseError'));
      return;
    }

    if (parseFloat(monthlyIncome) <= parseFloat(monthlyExpense)) {
      setError(t('fireCountdown.negativeBalanceError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      ...basicData,
      expectedReturn: expectedReturn[0],
      inflationRate: inflationRate[0],
      fireStrategy: fireStrategy || (locale === 'en-US' ? 'Standard' : '标准版'),
      city: city || (locale === 'en-US' ? 'Not specified' : '未指定'),
      age: age || (locale === 'en-US' ? 'Not specified' : '未指定'),
      additionalInfo: additionalInfo || (locale === 'en-US' ? 'None' : '无')
    };

    // Create prompt based on locale
    const prompt = locale === 'en-US'
      ? `Please help me calculate my financial independence countdown. My financial information is as follows:

Basic Information:
- Age: ${analysisData.age}
- City: ${analysisData.city}
- FIRE Strategy: ${analysisData.fireStrategy}

Income & Expenses:
- Monthly Income: $${analysisData.monthlyIncome}
- Monthly Expenses: $${analysisData.monthlyExpense}
- Monthly Net Savings: $${analysisData.monthlySavings?.toFixed(2)}
- Savings Rate: ${analysisData.savingsRate?.toFixed(1)}%
- Annual Expenses: $${analysisData.yearlyExpense}

Assets:
- Current Assets: $${analysisData.currentAssets}

Investment Expectations:
- Expected Annual Return: ${analysisData.expectedReturn}%
- Expected Inflation Rate: ${analysisData.inflationRate}%

FIRE Targets:
- Conservative (30x): $${analysisData.conservativeTarget?.toFixed(0)}
- Standard (25x): $${analysisData.standardTarget?.toFixed(0)}
- Aggressive (20x): $${analysisData.aggressiveTarget?.toFixed(0)}

Additional Information: ${analysisData.additionalInfo}

Please generate a detailed financial independence countdown analysis report based on this information, including time predictions, risk analysis, optimization suggestions, and action plans.`
      : `请帮我计算财务自由倒计时。我的财务信息如下：

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

请根据这些信息生成详细的财务自由倒计时分析报告，包括时间预测、风险分析、优化建议和行动计划。`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "fire-countdown",
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
        throw new Error(errorData.error || t('fireCountdown.calculationError'));
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t('fireCountdown.unknownError'));
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
          <span role="img" aria-label="fire" className="mr-2 text-4xl">🔥</span>
          {t('fireCountdown.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('fireCountdown.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 财务预览 */}
        {basicData && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">{t('fireCountdown.targetPreview')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-blue-600">{t('fireCountdown.conservativeVersion')}</div>
                  <div className="text-lg font-bold">{locale === 'en-US' ? '$' : '¥'}{(basicData.conservativeTarget / (locale === 'en-US' ? 1000 : 10000)).toFixed(0)}{t('fireCountdown.wan')}</div>
                  <div className="text-xs text-gray-500">{t('fireCountdown.yearExpenseMultiple30')}</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-green-600">{t('fireCountdown.standardVersion')}</div>
                  <div className="text-lg font-bold">{locale === 'en-US' ? '$' : '¥'}{(basicData.standardTarget / (locale === 'en-US' ? 1000 : 10000)).toFixed(0)}{t('fireCountdown.wan')}</div>
                  <div className="text-xs text-gray-500">{t('fireCountdown.yearExpenseMultiple25')}</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-red-600">{t('fireCountdown.aggressiveVersion')}</div>
                  <div className="text-lg font-bold">{locale === 'en-US' ? '$' : '¥'}{(basicData.aggressiveTarget / (locale === 'en-US' ? 1000 : 10000)).toFixed(0)}{t('fireCountdown.wan')}</div>
                  <div className="text-xs text-gray-500">{t('fireCountdown.yearExpenseMultiple20')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{t('fireCountdown.monthlySavings')}</div>
                  <div>{locale === 'en-US' ? '$' : '¥'}{basicData.monthlySavings.toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{t('fireCountdown.savingsRate')}</div>
                  <div>{basicData.savingsRate.toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{t('fireCountdown.yearlyExpense')}</div>
                  <div>{locale === 'en-US' ? '$' : '¥'}{(basicData.yearlyExpense / (locale === 'en-US' ? 1000 : 10000)).toFixed(1)}{t('fireCountdown.wan')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{t('fireCountdown.currentAssets')}</div>
                  <div>{locale === 'en-US' ? '$' : '¥'}{(basicData.currentAssets / (locale === 'en-US' ? 1000 : 10000)).toFixed(1)}{t('fireCountdown.wan')}</div>
                </div>
              </div>

              {expectedReturn.length > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">{t('fireCountdown.estimatedTime')}{expectedReturn[0]}{t('fireCountdown.estimatedTimeSuffix')}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>{t('fireCountdown.conservativeVersion')}: {calculateTimeToFire(basicData.conservativeTarget, basicData.currentAssets, basicData.monthlySavings, expectedReturn[0])}</div>
                    <div>{t('fireCountdown.standardVersion')}: {calculateTimeToFire(basicData.standardTarget, basicData.currentAssets, basicData.monthlySavings, expectedReturn[0])}</div>
                    <div>{t('fireCountdown.aggressiveVersion')}: {calculateTimeToFire(basicData.aggressiveTarget, basicData.currentAssets, basicData.monthlySavings, expectedReturn[0])}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 收支信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('fireCountdown.incomeExpenseInfo')}</h3>

            <div className="space-y-2">
              <Label htmlFor="monthly-income">{t('fireCountdown.monthlyIncomeLabel')}</Label>
              <Input
                id="monthly-income"
                type="number"
                placeholder={t('fireCountdown.monthlyIncomePlaceholder')}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-expense">{t('fireCountdown.monthlyExpenseLabel')}</Label>
              <Input
                id="monthly-expense"
                type="number"
                placeholder={t('fireCountdown.monthlyExpensePlaceholder')}
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-assets">{t('fireCountdown.currentAssetsLabel')}</Label>
              <Input
                id="current-assets"
                type="number"
                placeholder={t('fireCountdown.currentAssetsPlaceholder')}
                value={currentAssets}
                onChange={(e) => setCurrentAssets(e.target.value)}
              />
            </div>
          </div>

          {/* 个人信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('fireCountdown.personalInfo')}</h3>

            <div className="space-y-2">
              <Label htmlFor="age">{t('fireCountdown.ageLabel')}</Label>
              <Input
                id="age"
                type="number"
                placeholder={t('fireCountdown.agePlaceholder')}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t('fireCountdown.cityLabel')}</Label>
              <Input
                id="city"
                placeholder={t('fireCountdown.cityPlaceholder')}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fire-strategy">{t('fireCountdown.fireStrategyLabel')}</Label>
              <Select value={fireStrategy} onValueChange={setFireStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder={t('fireCountdown.fireStrategyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">{t('fireCountdown.strategies.conservative')}</SelectItem>
                  <SelectItem value="standard">{t('fireCountdown.strategies.standard')}</SelectItem>
                  <SelectItem value="aggressive">{t('fireCountdown.strategies.aggressive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t('fireCountdown.expectedReturnLabel')}{expectedReturn[0]}%</Label>
              <Slider
                value={expectedReturn}
                onValueChange={setExpectedReturn}
                max={15}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">{t('fireCountdown.expectedReturnTip')}</div>
            </div>

            <div className="space-y-2">
              <Label>{t('fireCountdown.inflationRateLabel')}{inflationRate[0]}%</Label>
              <Slider
                value={inflationRate}
                onValueChange={setInflationRate}
                max={8}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">{t('fireCountdown.inflationRateTip')}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">{t('fireCountdown.additionalInfoLabel')}</Label>
            <Textarea
              id="additional-info"
              placeholder={t('fireCountdown.additionalInfoPlaceholder')}
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
                {t('fireCountdown.calculating')}
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                {t('fireCountdown.calculateButton')}
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('fireCountdown.resetButton')}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{t('fireCountdown.errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {report && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">{t('fireCountdown.reportTitle')}</h3>
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
