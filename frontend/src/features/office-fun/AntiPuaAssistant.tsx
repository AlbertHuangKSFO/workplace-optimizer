'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Terminal } from 'lucide-react';
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            {TOOL_NAME}
          </CardTitle>
          <CardDescription>{TOOL_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="puaScenario" className="block text-sm font-medium text-gray-700 mb-1">
                  请详细描述您遇到的场景：
                </Label>
                <Textarea
                  id="puaScenario"
                  value={puaScenario}
                  onChange={(e) => setPuaScenario(e.target.value)}
                  placeholder="例如：我的老板总是模糊地批评我的工作，但从不给出具体改进建议，还经常在深夜给我发消息..."
                  rows={6}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? '分析中...' : '获取分析和建议'}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>发生错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {assistantResponse && (
            <div className="mt-6 space-y-4">
              <Separator />
              <h3 className="text-xl font-semibold">分析与建议：</h3>
              <div className="prose dark:prose-invert max-w-none bg-neutral-800 dark:bg-neutral-800 border border-neutral-700 dark:border-neutral-600 p-4 rounded-md">
                <ReactMarkdown>{assistantResponse}</ReactMarkdown>
              </div>
              {modelUsed && (
                <p className="text-xs text-muted-foreground">
                  模型由 {modelUsed} 提供支持
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <p>
            请注意：本工具提供的分析和建议仅供参考，不能替代专业的心理咨询或法律意见。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AntiPuaAssistant;
