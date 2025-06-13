import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanSquare, Loader2, RefreshCw } from 'lucide-react'; // RefreshCw for getting a new quote
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Daily Grind Affirmations
function DailyGrindAffirmations(): React.JSX.Element {
  const [affirmation, setAffirmation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAffirmation() {
    setIsLoading(true);
    setError(null);
    // setAffirmation(''); // Keep previous one while loading new, or clear, depends on UX preference

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '来一句今日限定的"打工人"专属语录，或毒鸡汤或真治愈都行！' }],
          toolId: 'daily-grind-affirmations',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '语录生成失败，可能是AI今天词穷了。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAffirmation(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for affirmation:', data);
        setError('AI返回的语录格式清奇，我暂时参悟不透...🧐');
      }
    } catch (e) {
      console.error('Failed to fetch affirmation:', e);
      setError(e instanceof Error ? e.message : '获取语录时发生未知错误，我的心灵导师罢工了！🧘');
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch one on initial load
  useEffect(() => {
    fetchAffirmation();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col items-center">
      <div className="flex items-center justify-center mb-6 text-center">
        <KanbanSquare className="w-8 h-8 text-lime-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">"打工人"每日亿句</h1>
        <KanbanSquare className="w-8 h-8 text-lime-400 ml-2" />
      </div>

      <p className="text-neutral-300 mb-8 text-center max-w-md">
        生活不易，打工叹气？<br/>让AI为你送上专属"打工人"语录，精准吐槽，或强效治愈！
      </p>

      <Button
        onClick={fetchAffirmation}
        disabled={isLoading}
        className="w-full max-w-xs bg-lime-500 hover:bg-lime-600 text-white text-lg py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 mb-8"
      >
        {isLoading && !affirmation ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在获取天机...
          </>
        ) : isLoading && affirmation ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 换一句...
          </>
        ) : (
          <><RefreshCw className="mr-2 h-5 w-5" /> {affirmation ? '换一句戳心窝子的' : '今日份精神食粮'}
          </>
        )}
      </Button>

      {error && (
        <Card className="w-full max-w-lg mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">语录加载失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !affirmation && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center w-full max-w-lg">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400 mb-4" />
          <p className="text-neutral-400">AI正在字斟句酌，准备直击你的灵魂...✍️</p>
        </div>
      )}

      {affirmation && (
        <Card className={`w-full max-w-lg flex-grow flex flex-col shadow-inner transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-50' : 'opacity-100'} bg-neutral-800 border-neutral-700`}>
          <CardHeader>
            <CardTitle className="text-lime-400 flex items-center">
              <KanbanSquare className="w-6 h-6 mr-2" /> 今日份"人间清醒"已送达：
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none break-words overflow-y-auto flex-grow p-6 leading-relaxed">
            <div className="text-left space-y-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{affirmation}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DailyGrindAffirmations;
