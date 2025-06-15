"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const NicknameGenerator = () => {
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description) {
      setError("请输入一些关键词、偏好或背景信息。");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "nickname-generator",
          messages: [
            {
              role: "user",
              content: JSON.stringify({
                description,
                style,
                purpose,
              }),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "生成昵称时发生错误。");
      }

      const data = await response.json();
      setResult(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "生成昵称时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="label" className="mr-2 text-4xl">🏷️</span>
          起名/花名生成器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          根据你的需求和偏好，生成有创意的昵称、花名或项目代号。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">关键词/偏好/背景信息</Label>
          <Textarea
            id="description"
            placeholder="例如：一个活泼的、用于技术团队的名称，喜欢动物元素..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="style">风格 (可选)</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue placeholder="选择一个风格" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">专业 Professional</SelectItem>
                <SelectItem value="funny">趣味 Funny</SelectItem>
                <SelectItem value="cool">酷炫 Cool</SelectItem>
                <SelectItem value="low-key">低调 Low-key</SelectItem>
                <SelectItem value="cute">可爱 Cute</SelectItem>
                <SelectItem value="techy">科技感 Techy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">用途 (可选)</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger id="purpose">
                <SelectValue placeholder="选择一个用途" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project-codename">项目代号 Project Codename</SelectItem>
                <SelectItem value="team-nickname">团队昵称 Team Nickname</SelectItem>
                <SelectItem value="personal-nickname">个人花名 Personal Nickname</SelectItem>
                <SelectItem value="product-name">产品名称 Product Name</SelectItem>
                <SelectItem value="event-name">活动名称 Event Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "生成中..." : "生成昵称"}
        </Button>
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

      {result && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">生成结果:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
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
                {result}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default NicknameGenerator;
