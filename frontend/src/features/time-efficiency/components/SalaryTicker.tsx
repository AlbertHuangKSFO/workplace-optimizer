"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from "@/lib/i18n";
import { useTranslations } from "@/lib/use-translations";
import { Calculator, Loader2, Play, Square, Terminal, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  locale: ValidLocale;
}

const SalaryTicker = ({ locale }: Props) => {
  const { t, loading } = useTranslations(locale);
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

  // 如果翻译还在加载，显示加载状态
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

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
      setError(t("salaryTicker.requiredFieldsError"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      salaryType: t(`salaryTicker.salaryTypes.${salaryType}`),
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
              content: t("salaryTicker.apiRequest", {
                salaryType: analysisData.salaryType,
                currency: t("salaryTicker.currency"),
                salaryAmount: analysisData.salaryAmount,
                workHoursPerDay: analysisData.workHoursPerDay,
                workDaysPerWeek: analysisData.workDaysPerWeek,
                city: analysisData.city,
                yearlyIncome: analysisData.yearlyIncome?.toFixed(2),
                monthlyIncome: analysisData.monthlyIncome?.toFixed(2),
                dailyIncome: analysisData.dailyIncome?.toFixed(2),
                hourlyRate: analysisData.hourlyRate?.toFixed(2),
                minuteRate: analysisData.minuteRate?.toFixed(4),
                secondRate: analysisData.secondRate?.toFixed(6),
                additionalInfo: analysisData.additionalInfo
              }),
            },
          ],
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("salaryTicker.analysisError"));
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t("salaryTicker.unknownError"));
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

  const currency = t("salaryTicker.currency");

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="money" className="mr-2 text-4xl">💰</span>
          {t("salaryTicker.title")}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t("salaryTicker.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 实时收入显示 */}
        {basicData && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">💸 {t("salaryTicker.realtimeTimerSection")}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{t("salaryTicker.hourlyRate")}</div>
                  <div>{currency}{basicData.hourlyRate.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{t("salaryTicker.minuteRate")}</div>
                  <div>{currency}{basicData.minuteRate.toFixed(4)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{t("salaryTicker.secondRate")}</div>
                  <div>{currency}{basicData.secondRate.toFixed(6)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{t("salaryTicker.dailyRate")}</div>
                  <div>{currency}{basicData.dailyIncome.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {t("salaryTicker.currentEarnings", { amount: currentEarnings.toFixed(4) })}
                </div>
                <div className="flex justify-center gap-2">
                  {!isTickerRunning ? (
                    <Button onClick={startTicker} className="bg-green-600 hover:bg-green-700">
                      <Play className="mr-2 h-4 w-4" />
                      {t("salaryTicker.startTimer")}
                    </Button>
                  ) : (
                    <Button onClick={stopTicker} variant="destructive">
                      <Square className="mr-2 h-4 w-4" />
                      {t("salaryTicker.stopTimer")}
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
            <h3 className="text-lg font-semibold">💼 {t("salaryTicker.salaryInfoSection")}</h3>

            <div className="space-y-2">
              <Label htmlFor="salary-type">{t("salaryTicker.salaryTypeLabel")} *</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("salaryTicker.salaryTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("salaryTicker.salaryTypes.monthly")}</SelectItem>
                  <SelectItem value="yearly">{t("salaryTicker.salaryTypes.yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary-amount">{t("salaryTicker.salaryAmountLabel")} *</Label>
              <Input
                id="salary-amount"
                type="number"
                placeholder={t("salaryTicker.salaryAmountPlaceholder")}
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("salaryTicker.cityLabel")}</Label>
              <Input
                id="city"
                placeholder={t("salaryTicker.cityPlaceholder")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* 工作时间 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⏰ {t("salaryTicker.workTimeSection")}</h3>

            <div className="space-y-2">
              <Label htmlFor="work-hours">{t("salaryTicker.workHoursPerDayLabel")}</Label>
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
              <Label htmlFor="work-days">{t("salaryTicker.workDaysPerWeekLabel")}</Label>
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
              <Label htmlFor="additional-info">{t("salaryTicker.additionalInfoLabel")}</Label>
              <Textarea
                id="additional-info"
                placeholder={t("salaryTicker.additionalInfoPlaceholder")}
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
                {t("salaryTicker.analyzingButton")}
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                {t("salaryTicker.analyzeButton")}
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t("salaryTicker.resetButton")}
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
            <h3 className="text-lg font-semibold">{t("salaryTicker.reportTitle")}</h3>
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
