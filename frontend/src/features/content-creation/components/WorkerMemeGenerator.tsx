"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Terminal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MemeResult {
  memeText: string;
  imagePromptSuggestion: string;
  imageUrl: string;
}

const WorkerMemeGenerator: React.FC = () => {
  const [scenario, setScenario] = useState("");
  const [mood, setMood] = useState("");
  const [imgStyle, setImgStyle] = useState("cartoon");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MemeResult | null>(null);

  const handleGenerate = async () => {
    if (!scenario) {
      setError("请填写场景描述！");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: get memeText & imagePromptSuggestion via AI
      const chatResp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "worker-meme-generator",
          messages: [
            {
              role: "user",
              content: JSON.stringify({ scenario, mood }),
            },
          ],
        }),
      });

      if (!chatResp.ok) {
        const errData = await chatResp.json().catch(() => ({}));
        throw new Error(errData.error || "AI 生成表情包文案失败");
      }

      const chatData = await chatResp.json();
      let memeJson: { memeText: string; imagePromptSuggestion: string };
      try {
        memeJson = JSON.parse(chatData.assistantMessage);
      } catch (e) {
        throw new Error("AI 返回的 JSON 格式解析失败");
      }

      // Step 2: call image generation API
      const imgResp = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: memeJson.imagePromptSuggestion, style: imgStyle }),
      });

      if (!imgResp.ok) {
        const errData = await imgResp.json().catch(() => ({}));
        throw new Error(errData.error || "生成图片失败");
      }

      const imgData = await imgResp.json();
      const imageUrl = imgData.imageUrl as string;
      if (!imageUrl) throw new Error("图片 URL 无效");

      setResult({ ...memeJson, imageUrl });
    } catch (e: any) {
      setError(e.message || "生成表情包时发生未知错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="meme" className="mr-2 text-4xl">🖼️</span>
          打工人表情包生成器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          输入职场场景，让 AI 帮你生成表情包文案和配图！
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="scenario">场景描述 <span className="text-red-500">*</span></Label>
          <Textarea id="scenario" rows={3} placeholder="例如：周一早上开会，却还没喝咖啡..." value={scenario} onChange={(e)=>setScenario(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mood">心情/风格 (可选)</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger id="mood"><SelectValue placeholder="选择心情"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="摸鱼">摸鱼</SelectItem>
                <SelectItem value="无奈">无奈</SelectItem>
                <SelectItem value="内卷">内卷</SelectItem>
                <SelectItem value="佛系">佛系</SelectItem>
                <SelectItem value="沙雕">沙雕</SelectItem>
                <SelectItem value="自嘲">自嘲</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">图片风格</Label>
            <Select value={imgStyle} onValueChange={setImgStyle}>
              <SelectTrigger id="style"><SelectValue placeholder="选择风格"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="sketch">Sketch</SelectItem>
                <SelectItem value="doodle">Doodle</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button disabled={isLoading} onClick={handleGenerate} className="w-full">
          {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/> 生成中...</>) : "生成表情包"}
        </Button>
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <div className="space-y-4">
            <div className="relative w-full">
              <Image src={result.imageUrl} alt="meme" width={512} height={512} className="rounded" />
              {/* overlay text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-2xl font-bold text-center drop-shadow-lg px-2">
                  {result.memeText}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">图片提示词: {result.imagePromptSuggestion}</p>
          </div>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default WorkerMemeGenerator;
