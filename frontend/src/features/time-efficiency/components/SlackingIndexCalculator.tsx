"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from "@/lib/i18n";
import { useTranslations } from "@/lib/use-translations";
import { Calculator, Loader2, Terminal, Waves } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  locale: ValidLocale;
}

const SlackingIndexCalculator = ({ locale }: Props) => {
  const { t, loading } = useTranslations(locale);
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

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const handleCalculate = async () => {
    if (!slackingFrequency || !workEfficiency || !riskLevel) {
      setError(t("slackingIndexCalculator.requiredFieldsError"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      workHours: workHours[0],
      actualWorkHours: actualWorkHours[0],
      slackingFrequency: t(`slackingIndexCalculator.frequencies.${slackingFrequency}`),
      slackingDuration: slackingDuration[0],
      slackingActivities: slackingActivities || t("slackingIndexCalculator.slackingActivitiesPlaceholder"),
      workEfficiency: t(`slackingIndexCalculator.efficiencyLevels.${workEfficiency}`),
      riskLevel: t(`slackingIndexCalculator.riskLevels.${riskLevel}`),
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
              content: t("slackingIndexCalculator.apiRequest", {
                workHours: analysisData.workHours.toString(),
                actualWorkHours: analysisData.actualWorkHours.toString(),
                slackingFrequency: analysisData.slackingFrequency,
                slackingDuration: analysisData.slackingDuration.toString(),
                slackingActivities: analysisData.slackingActivities,
                workEfficiency: analysisData.workEfficiency,
                riskLevel: analysisData.riskLevel,
                additionalInfo: analysisData.additionalInfo
              }),
            },
          ],
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("slackingIndexCalculator.calculationError"));
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t("slackingIndexCalculator.unknownError"));
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
          {t("slackingIndexCalculator.title")}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t("slackingIndexCalculator.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 工作时间设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⏰ {t("slackingIndexCalculator.workTimeSection")}</h3>

            <div className="space-y-2">
              <Label>{t("slackingIndexCalculator.workHoursLabel", { hours: workHours[0].toString() })}</Label>
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
              <Label>{t("slackingIndexCalculator.actualWorkHoursLabel", { hours: actualWorkHours[0].toString() })}</Label>
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
            <h3 className="text-lg font-semibold">🎣 {t("slackingIndexCalculator.slackingBehaviorSection")}</h3>

            <div className="space-y-2">
              <Label htmlFor="slacking-frequency">{t("slackingIndexCalculator.slackingFrequencyLabel")} *</Label>
              <Select value={slackingFrequency} onValueChange={setSlackingFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder={t("slackingIndexCalculator.slackingFrequencyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rarely">{t("slackingIndexCalculator.frequencies.rarely")}</SelectItem>
                  <SelectItem value="occasionally">{t("slackingIndexCalculator.frequencies.occasionally")}</SelectItem>
                  <SelectItem value="frequently">{t("slackingIndexCalculator.frequencies.frequently")}</SelectItem>
                  <SelectItem value="constantly">{t("slackingIndexCalculator.frequencies.constantly")}</SelectItem>
                  <SelectItem value="professional">{t("slackingIndexCalculator.frequencies.professional")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("slackingIndexCalculator.slackingDurationLabel", { duration: slackingDuration[0].toString() })}</Label>
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
            <Label htmlFor="slacking-activities">{t("slackingIndexCalculator.slackingActivitiesLabel")}</Label>
            <Textarea
              id="slacking-activities"
              placeholder={t("slackingIndexCalculator.slackingActivitiesPlaceholder")}
              value={slackingActivities}
              onChange={(e) => setSlackingActivities(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-efficiency">{t("slackingIndexCalculator.workEfficiencyLabel")} *</Label>
              <Select value={workEfficiency} onValueChange={setWorkEfficiency}>
                <SelectTrigger>
                  <SelectValue placeholder={t("slackingIndexCalculator.workEfficiencyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veryHigh">{t("slackingIndexCalculator.efficiencyLevels.veryHigh")}</SelectItem>
                  <SelectItem value="high">{t("slackingIndexCalculator.efficiencyLevels.high")}</SelectItem>
                  <SelectItem value="medium">{t("slackingIndexCalculator.efficiencyLevels.medium")}</SelectItem>
                  <SelectItem value="low">{t("slackingIndexCalculator.efficiencyLevels.low")}</SelectItem>
                  <SelectItem value="veryLow">{t("slackingIndexCalculator.efficiencyLevels.veryLow")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-level">{t("slackingIndexCalculator.riskLevelLabel")} *</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder={t("slackingIndexCalculator.riskLevelPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veryLow">{t("slackingIndexCalculator.riskLevels.veryLow")}</SelectItem>
                  <SelectItem value="low">{t("slackingIndexCalculator.riskLevels.low")}</SelectItem>
                  <SelectItem value="medium">{t("slackingIndexCalculator.riskLevels.medium")}</SelectItem>
                  <SelectItem value="high">{t("slackingIndexCalculator.riskLevels.high")}</SelectItem>
                  <SelectItem value="veryHigh">{t("slackingIndexCalculator.riskLevels.veryHigh")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">{t("slackingIndexCalculator.additionalInfoLabel")}</Label>
            <Textarea
              id="additional-info"
              placeholder={t("slackingIndexCalculator.additionalInfoPlaceholder")}
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
                {t("slackingIndexCalculator.calculatingButton")}
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                {t("slackingIndexCalculator.calculateButton")}
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <Waves className="mr-2 h-4 w-4" />
            {t("slackingIndexCalculator.resetButton")}
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
            <h3 className="text-lg font-semibold">{t("slackingIndexCalculator.reportTitle")}</h3>
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
