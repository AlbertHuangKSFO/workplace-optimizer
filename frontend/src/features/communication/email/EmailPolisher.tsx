'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const emailTypes = [
  { value: 'formal', label: '正式商务邮件' },
  { value: 'informal', label: '非正式内部邮件' },
  { value: 'apology', label: '道歉邮件' },
  { value: 'thank-you', label: '感谢邮件' },
  { value: 'request', label: '请求/申请邮件' },
  { value: 'follow-up', label: '跟进邮件' },
  { value: 'announcement', label: '通知/公告邮件' },
  { value: 'complaint', label: '投诉/反馈邮件' },
];

function EmailPolisher(): React.JSX.Element {
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [emailType, setEmailType] = useState<string>('formal');
  const [polishedEmail, setPolishedEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!originalEmail.trim()) {
      setError('请输入需要润色的邮件内容！');
      setPolishedEmail('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPolishedEmail('');

    const selectedType = emailTypes.find(t => t.value === emailType);
    const userPrompt = `请帮我润色以下邮件，使其符合${selectedType?.label}的标准和语气：\n\n${originalEmail}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'email-polisher',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '邮件润色失败，可能是AI的商务礼仪课程还在进修中。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setPolishedEmail(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for email polishing:', data);
        setError('AI返回的润色结果有点奇怪，我暂时解读不了...📧');
      }
    } catch (e) {
      console.error('Failed to polish email:', e);
      setError(e instanceof Error ? e.message : '润色邮件时发生未知错误，我的邮件助手罢工了！📮');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Mail className="w-8 h-8 text-green-600 dark:text-green-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">邮件润色器</h1>
        <Mail className="w-8 h-8 text-green-600 dark:text-green-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="originalEmail" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            输入需要润色的邮件内容：
          </Label>
          <Textarea
            id="originalEmail"
            value={originalEmail}
            onChange={(e) => setOriginalEmail(e.target.value)}
            placeholder="例如：Hi，关于那个项目的事情，我想说一下我的想法..."
            className={cn(
              "w-full min-h-[150px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={6}
          />
        </div>
        <div>
          <Label htmlFor="emailType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            邮件类型：
          </Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder="选择邮件类型..." />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {emailTypes.map(type => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI正在精心润色...
            </>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 开始润色邮件！
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">润色失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !polishedEmail && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 dark:text-green-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">AI邮件专家正在为您的邮件添加专业光泽...✨</p>
        </div>
      )}

      {polishedEmail && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> 润色后的邮件：
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{polishedEmail}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EmailPolisher;
