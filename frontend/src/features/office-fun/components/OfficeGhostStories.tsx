"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ghost, Loader2, Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const OfficeGhostStories = () => {
  const [storyRequest, setStoryRequest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "office-ghost-stories",
          messages: [
            {
              role: "user",
              content: storyRequest.trim() || "请为我创作一个办公室鬼故事",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成鬼故事时发生错误。");
      }

      const data = await response.json();
      setStory(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "生成鬼故事时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomStory = () => {
    setStoryRequest("");
    handleGenerateStory();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="ghost" className="mr-2 text-4xl">👻</span>
          办公室鬼故事
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          上班族专属恐怖故事，提神醒脑，让疲惫的工作日变得刺激一些
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="story-request">故事要求（可选）</Label>
          <Textarea
            id="story-request"
            placeholder="例如：我想听一个关于深夜加班时电梯里发生的恐怖故事..."
            value={storyRequest}
            onChange={(e) => setStoryRequest(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            留空将随机生成一个办公室鬼故事
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleGenerateStory} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在创作恐怖故事...
              </>
            ) : (
              <>
                <Ghost className="mr-2 h-4 w-4" />
                生成故事
              </>
            )}
          </Button>
          <Button
            onClick={handleRandomStory}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            随机故事
          </Button>
        </div>
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

      {story && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">恐怖故事:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-red-500 dark:text-red-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-red-600 dark:text-red-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                  hr: ({node, ...props}) => <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />,
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
                {story}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default OfficeGhostStories;
