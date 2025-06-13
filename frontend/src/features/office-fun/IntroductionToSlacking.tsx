import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Introduction to Slacking
function IntroductionToSlacking(): React.JSX.Element {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Please provide the content for Introduction to Slacking.' }], // User message can be generic
            toolId: 'introduction-to-slacking',
            // We might need to send language preference later if the content is multilingual
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch content and parse error response.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Assuming the API returns a structure like: { choices: [{ message: { content: "markdown string" } }] }
        // Or directly the markdown string if the backend is tailored for this.
        // Let's assume for now the backend directly returns the assistant's message content.
        if (data && data.assistantMessage) {
          setContent(data.assistantMessage);
        } else if (typeof data === 'string') { // Fallback if API returns string directly
            setContent(data);
        }
        else {
          // Adjust this based on the actual API response structure for tool-specific content
          console.warn('Unexpected API response structure:', data);
          setContent('No content received or in unexpected format.');
        }

      } catch (e) {
        console.error('Failed to fetch Introduction to Slacking content:', e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-sky-400">摸鱼学导论</h1>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full py-10">
          <Loader2 className="h-12 w-12 animate-spin text-sky-500 mb-4" />
          <p className="text-neutral-400">正在加载旷世巨作《摸鱼学导论》...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-full py-10">
          <p className="text-red-400 bg-red-900/50 p-4 rounded-md">加载失败：{error}</p>
          <p className="text-neutral-500 mt-2 text-sm">（请确保后端服务正常，并且 'introduction-to-slacking' 的 prompt 文件已就绪。）</p>
        </div>
      )}

      {!isLoading && !error && content && (
        <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}
       {!isLoading && !error && !content && (
        <div className="flex flex-col items-center justify-center h-full py-10">
          <p className="text-neutral-400">未找到《摸鱼学导论》的内容。是不是被哪个大神偷偷藏起来了？🤔</p>
        </div>
      )}
    </div>
  );
}

export default IntroductionToSlacking;
