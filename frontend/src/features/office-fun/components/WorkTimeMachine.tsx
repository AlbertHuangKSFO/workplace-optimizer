"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Terminal } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

// Added local type definition for CodeProps
type CodeProps = React.ComponentPropsWithoutRef<'code'> & {
  node?: any;
  inline?: boolean;
};

const WorkTimeMachine = () => {
  const [currentWork, setCurrentWork] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeReport, setTimeReport] = useState<string | null>(null);

  const handleTimeTravel = async () => {
    if (!currentWork.trim()) {
      setError("请描述你的当前工作情况。");
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "时光穿越时发生错误。");
      }

      const data = await response.json();
      setTimeReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "时光穿越时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="time-machine" className="mr-2 text-4xl">⏰</span>
          时光机工作体验
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          体验30年前、现在和30年后的工作方式，感受职场时代变迁
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="current-work">当前工作情况</Label>
          <Textarea
            id="current-work"
            placeholder="例如：我是一名软件工程师，主要负责前端开发，每天需要参加很多线上会议，使用各种协作工具..."
            value={currentWork}
            onChange={(e) => setCurrentWork(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleTimeTravel} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在穿越时空...
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              启动时光机
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

      {timeReport && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">时光机体验报告:</h3>
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
