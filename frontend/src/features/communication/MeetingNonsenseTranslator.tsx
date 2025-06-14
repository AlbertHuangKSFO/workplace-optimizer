'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MeetingNonsenseTranslator: React.FC = () => {
  const [originalText, setOriginalText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!originalText.trim()) {
      setError('请输入需要翻译的会议内容！');
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    const userPrompt = originalText; // The raw meeting content is the primary input

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'meeting-nonsense-translator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '会议废话过滤器今天有点"啰嗦"，暂时无法服务。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setTranslatedText(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for meeting nonsense translator:', data);
        throw new Error('AI返回的"翻译"结果有点不寻常...');
      }
    } catch (e) {
      console.error('Failed to translate meeting nonsense:', e);
      const errorMessage = e instanceof Error ? e.message : '翻译会议废话时发生未知错误，可能是AI的"废话引擎"过热了！';
      setError(errorMessage);
      setTranslatedText(''); // Clear previous results on error
    } finally {
      setIsLoading(false);
    }
  }, [originalText]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="megaphone" className="mr-2 text-4xl">📢</span>
          会议废话翻译器
        </CardTitle>
        <CardDescription className="mt-1 text-base">
          粘贴冗长会议内容，AI帮你一键"脱水"，直击核心，拒绝废话！
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <Textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="例如：嗯...那个...我想说的是，关于这个项目，我觉得吧，总的来说，呃，还是不错的，但是呢，可能有些小地方...大家懂我意思吧...就是那个什么...对吧..."
            className="min-h-[150px] w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
            rows={6}
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI正在精炼中...
            </>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 开始翻译废话
            </>
          )}
        </Button>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {translatedText && !isLoading && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-center text-sky-700 dark:text-sky-300">"翻译"结果：</h3>
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
            </div>
          </div>
        )}
         {isLoading && !translatedText && !error && (
          <div className="text-center py-6 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">AI正在过滤会议中的水分，请稍候...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingNonsenseTranslator;
