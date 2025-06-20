"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ValidLocale } from "@/lib/i18n";
import { useTranslations } from "@/lib/use-translations";
import { Ghost, Loader2, Terminal } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

// Added local type definition for CodeProps
type CodeProps = React.ComponentPropsWithoutRef<'code'> & {
  node?: any;
  inline?: boolean;
};

interface Props {
  locale: ValidLocale;
}

const OfficeGhostStories: React.FC<Props> = ({ locale }) => {
  const { t, loading } = useTranslations(locale);
  const [storyRequest, setStoryRequest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

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
          locale: locale,
          messages: [
            {
              role: "user",
              content: storyRequest.trim() || t('officeGhostStories.defaultRequest'),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('officeGhostStories.generateError'));
      }

      const data = await response.json();
      setStory(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || t('officeGhostStories.unknownError'));
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
          {t('officeGhostStories.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('officeGhostStories.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="story-request">{t('officeGhostStories.storyRequestLabel')}</Label>
          <Textarea
            id="story-request"
            placeholder={t('officeGhostStories.storyRequestPlaceholder')}
            value={storyRequest}
            onChange={(e) => setStoryRequest(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('officeGhostStories.storyRequestHint')}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleGenerateStory} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('officeGhostStories.generating')}
              </>
            ) : (
              <>
                <Ghost className="mr-2 h-4 w-4" />
                {t('officeGhostStories.generateButton')}
              </>
            )}
          </Button>
          <Button
            onClick={handleRandomStory}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {t('officeGhostStories.randomButton')}
          </Button>
        </div>
      </CardContent>

      {error && (
        <CardFooter>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{t('officeGhostStories.errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardFooter>
      )}

      {story && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">{t('officeGhostStories.storyTitle')}</h3>
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
