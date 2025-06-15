"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const ParallelUniverseWorkSimulator = () => {
  const [workSituation, setWorkSituation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!workSituation.trim()) {
      setError("请描述你的工作状况或困扰。");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "parallel-universe-work-simulator",
          messages: [
            {
              role: "user",
              content: workSituation,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "模拟平行宇宙时发生错误。");
      }

      const data = await response.json();
      setResult(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "模拟平行宇宙时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="universe" className="mr-2 text-4xl">🌌</span>
          平行宇宙工作模拟器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          描述你的工作困扰，看看在其他平行宇宙中会发生什么有趣的事情！
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="work-situation">当前工作状况或困扰</Label>
          <Textarea
            id="work-situation"
            placeholder="例如：老板总是在下班时间安排紧急任务，让我很困扰..."
            value={workSituation}
            onChange={(e) => setWorkSituation(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleSimulate} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在扫描平行宇宙...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              开始模拟
            </>
          )}
        </Button>
      </CardContent>

      {error && (
        <CardFooter>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardFooter>
      )}

      {result && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">平行宇宙模拟结果:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-purple-600 dark:text-purple-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />,
                  code: ({node, inline, className, children, ...props}) => {
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
                {result}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ParallelUniverseWorkSimulator;
