"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from "@/lib/i18n";
import { useTranslations } from "@/lib/use-translations";
import { Clock, Loader2, Terminal } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

// Added local type definition for CodeProps
type CodeProps = React.ComponentPropsWithoutRef<'code'> & {
  node?: any;
  inline?: boolean;
};

interface Props {
  locale: ValidLocale;
}

const WorkTimeMachine = ({ locale }: Props) => {
  const { t, loading } = useTranslations(locale);
  const [currentWork, setCurrentWork] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeReport, setTimeReport] = useState<string | null>(null);

  // 如果翻译还在加载，显示加载状态
  if (loading) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const handleTimeTravel = async () => {
    if (!currentWork.trim()) {
      setError(t("workTimeMachine.emptyWorkError"));
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeReport(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "work-time-machine",
          messages: [
            {
              role: "user",
              content: currentWork,
            },
          ],
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("workTimeMachine.travelError"));
      }

      const data = await response.json();
      setTimeReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t("workTimeMachine.unknownError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="time-machine" className="mr-2 text-4xl">⏰</span>
          {t("workTimeMachine.title")}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t("workTimeMachine.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="current-work">{t("workTimeMachine.currentWorkLabel")}</Label>
          <Textarea
            id="current-work"
            placeholder={t("workTimeMachine.currentWorkPlaceholder")}
            value={currentWork}
            onChange={(e) => setCurrentWork(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleTimeTravel} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("workTimeMachine.travelingButton")}
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              {t("workTimeMachine.startButton")}
            </>
          )}
        </Button>
      </CardContent>

      {error && (
        <CardFooter>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{t("workTimeMachine.errorTitle")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardFooter>
      )}

      {timeReport && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">{t("workTimeMachine.reportTitle")}</h3>
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
                  code: ({node, inline, className, children, ...props}: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <div className="my-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {timeReport}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default WorkTimeMachine;
