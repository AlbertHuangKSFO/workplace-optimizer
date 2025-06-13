'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { ShieldAlert, Terminal } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const TOOL_ID = 'anti-pua-assistant';
const TOOL_NAME = '“拒绝PUA”小助手';
const TOOL_DESCRIPTION =
  '描述您在职场中遇到的疑似PUA（精神控制）的场景，小助手将尝试分析并提供应对建议。';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function AntiPuaAssistant(): React.JSX.Element {
  const [puaScenario, setPuaScenario] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!puaScenario.trim()) {
      setError('请输入您遇到的PUA场景描述。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssistantResponse('');
    setModelUsed(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: TOOL_ID,
          messages: [{ role: 'user', content: puaScenario }],
          language: 'zh', // Assuming Chinese language for this tool
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `请求失败，状态码：${response.status}`,
        );
      }

      const data = await response.json();
      setAssistantResponse(data.assistantMessage);
      setModelUsed(data.modelUsed || null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('发生未知错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("container mx-auto p-4 md:p-6 lg:p-8", "bg-transparent")}>
      <Card className={cn("max-w-2xl mx-auto", "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800")}>
        <CardHeader>
          <CardTitle className={cn("text-2xl font-bold flex items-center", "text-neutral-900 dark:text-neutral-100")}>
            <ShieldAlert className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
            {TOOL_NAME}
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">{TOOL_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="text-neutral-900 dark:text-neutral-100">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="puaScenario" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  请详细描述您遇到的场景：
                </Label>
                <Textarea
                  id="puaScenario"
                  value={puaScenario}
                  onChange={(e) => setPuaScenario(e.target.value)}
                  placeholder="例如：我的老板总是模糊地批评我的工作，但从不给出具体改进建议，还经常在深夜给我发消息..."
                  rows={6}
                  className={cn(
                    "w-full",
                    "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                    "text-neutral-900 dark:text-neutral-100",
                    "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500",
                    "disabled:bg-neutral-200 dark:disabled:bg-neutral-700/50 disabled:text-neutral-500 dark:disabled:text-neutral-400"
                  )}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className={cn(
                  "w-full sm:w-auto text-white",
                  "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
                  "disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:text-neutral-500 dark:disabled:text-neutral-400"
                )}
                disabled={isLoading}
              >
                {isLoading ? '分析中...' : '获取分析和建议'}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6 bg-red-50 dark:bg-red-900/30 border-red-500/50 dark:border-red-700/50 text-red-700 dark:text-red-400">
              <Terminal className="h-4 w-4 text-red-700 dark:text-red-400" />
              <AlertTitle>发生错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {assistantResponse && (
            <div className="mt-6 space-y-4">
              <Separator className="bg-neutral-200 dark:bg-neutral-800" />
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">分析与建议：</h3>
              <div className={cn(
                "prose dark:prose-invert max-w-none p-4 rounded-md",
                "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100"
              )}>
                <ReactMarkdown>{assistantResponse}</ReactMarkdown>
              </div>
              {modelUsed && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  模型由 {modelUsed} 提供支持
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-neutral-500 dark:text-neutral-400">
          <p>
            请注意：本工具提供的分析和建议仅供参考，不能替代专业的心理咨询或法律意见。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AntiPuaAssistant;
