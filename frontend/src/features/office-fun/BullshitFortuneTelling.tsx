import { Loader2, Star } from 'lucide-react'; // Changed Sparkles to Star
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Daily Slacking Almanac
function BullshitFortuneTelling(): React.JSX.Element { // Renamed function
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFortune() { // Renamed function
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: '今日运势如何（胡说版）？请用一本正经胡说八道的方式告诉我。' }],
            toolId: 'bullshit-fortune-telling', // Updated toolId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch fortune and parse error response.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.assistantMessage) {
          setContent(data.assistantMessage);
        } else {
          console.warn('Unexpected API response structure for fortune:', data);
          setContent('未能获取今日胡说运势，宇宙的信号可能被屏蔽了。🌀');
        }

      } catch (e) {
        console.error('Failed to fetch Bullshit Fortune Telling content:', e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching fortune.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFortune(); // Renamed function call
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full overflow-y-auto">
      <div className="flex items-center justify-center mb-6">
        <Star className="w-8 h-8 text-yellow-400 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 text-center">今日运势（胡说版）</h1>
        <Star className="w-8 h-8 text-yellow-400 ml-3" />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-4/5">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
          <p className="text-neutral-400">AI大师正在为你观测宇宙射线，解读今日的胡说能量场...✨</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-4/5">
          <p className="text-red-400 bg-red-900/50 p-4 rounded-md">胡说运势加载失败：{error}</p>
          <p className="text-neutral-500 mt-2 text-sm">（可能是AI今天不想胡说了，或者后台的胡说引擎出了点小问题。）</p>
        </div>
      )}

      {!isLoading && !error && content && (
        <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words bg-neutral-800/50 p-4 sm:p-6 rounded-md shadow-inner">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}
       {!isLoading && !error && !content && (
        <div className="flex flex-col items-center justify-center h-4/5">
          <p className="text-neutral-400">今日的胡说能量不足，无法生成运势。要不...你先努力工作一会儿？😉</p>
        </div>
      )}
    </div>
  );
}

export default BullshitFortuneTelling; // Renamed export
