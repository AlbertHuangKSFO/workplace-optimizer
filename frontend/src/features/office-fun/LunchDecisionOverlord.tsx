import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Utensils, Zap } from 'lucide-react'; // Zap for the decision action
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Lunch Decision Overlord
function LunchDecisionOverlord(): React.JSX.Element {
  const [lunchSuggestion, setLunchSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDecideLunch() {
    setIsLoading(true);
    setError(null);
    setLunchSuggestion('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '本霸主，速速为我决定今日午餐！可加入一些随机、有趣的选项或条件。' }], // User message can be generic but engaging
          toolId: 'lunch-decision-overlord',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '午餐圣旨传达失败，可能是御膳房太忙了。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setLunchSuggestion(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for lunch suggestion:', data);
        setError('AI返回的午餐建议有点神秘，本霸主暂时无法解读...👑');
      }
    } catch (e) {
      console.error('Failed to fetch lunch suggestion:', e);
      setError(e instanceof Error ? e.message : '决定午餐时发生未知错误，选择困难症又犯了！🤯');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col items-center">
      <div className="flex items-center justify-center mb-6 text-center">
        <Utensils className="w-10 h-10 text-amber-400 mr-3" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">"今天中午吃什么？"<br/>终极选择器</h1>
        <Utensils className="w-10 h-10 text-amber-400 ml-3" />
      </div>

      <p className="text-neutral-300 mb-8 text-center max-w-md">
        还在为"中午吃啥"这一世纪难题而纠结吗？<br/>让本霸主为你一锤定音！你只管放空大脑，等待圣旨！
      </p>

      <Button
        onClick={handleDecideLunch}
        disabled={isLoading}
        className="w-full max-w-xs bg-amber-500 hover:bg-amber-600 text-white text-lg py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 mb-8"
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 本霸主正在为你钦点御膳...
          </>
        ) : (
          <><Zap className="mr-2 h-5 w-5" /> 立即决定！听我号令！
          </>
        )}
      </Button>

      {error && (
        <Card className="w-full max-w-md mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">选择失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !lunchSuggestion && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center w-full max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mb-4" />
          <p className="text-neutral-400">御膳房正在紧急备料，圣旨即将下达...🍲</p>
        </div>
      )}

      {lunchSuggestion && !isLoading && (
        <Card className="w-full max-w-md flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center">
              <Utensils className="w-6 h-6 mr-2" /> 本霸主钦定：今日午餐！
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lunchSuggestion}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LunchDecisionOverlord;
