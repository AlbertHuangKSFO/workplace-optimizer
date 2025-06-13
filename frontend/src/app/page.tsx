'use client';

import { ModelSelector } from '@/components/layout/ModelSelector';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateText as callGenerateTextApi } from '@/services/generationService';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [inputText, setInputText] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultModelIdFromSelector, setDefaultModelIdFromSelector] = useState<string>('');

  const handleModelInitialized = (defaultModelId: string) => {
    if (defaultModelId) {
        setSelectedModel(defaultModelId);
        setDefaultModelIdFromSelector(defaultModelId);
    }
  };

  useEffect(() => {
    if (defaultModelIdFromSelector && !selectedModel) {
        setSelectedModel(defaultModelIdFromSelector);
    }
  }, [defaultModelIdFromSelector, selectedModel]);

  const handleGenerateClick = async () => {
    if (!inputText.trim()) {
      setError('请输入需要处理的文本。');
      return;
    }
    if (!selectedModel) {
      setError('请选择一个 AI 模型。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedText('');

    try {
      const response = await callGenerateTextApi({
        modelId: selectedModel,
        inputText,
        systemPrompt: systemPrompt.trim() || undefined,
      });
      setGeneratedText(response.generatedText);
    } catch (apiError: any) {
      console.error('API Error:', apiError);
      setError(apiError.message || '生成文本时发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 text-neutral-100">
      <h1 className="text-3xl font-semibold mb-6">
        职场沟通优化器
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="model-selector" className="text-lg mb-2 block">选择模型</Label>
            <ModelSelector
              selectedModelId={selectedModel}
              onModelSelect={setSelectedModel}
              onModelInitialized={handleModelInitialized}
            />
          </div>
          <div>
            <Label htmlFor="system-prompt" className="text-lg">系统提示 (可选)</Label>
            <p className="text-sm text-neutral-400 mb-2">
              给 AI 的指令，例如："请将以下文本改写得更礼貌"、"请将这段话润色，用于正式邮件"。
            </p>
            <Textarea
              id="system-prompt"
              placeholder="例如：请将以下文本改写得更专业和简洁。"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[100px] bg-neutral-800 border-neutral-700 placeholder-neutral-500 text-neutral-100"
            />
          </div>
          <div>
            <Label htmlFor="input-text" className="text-lg">输入文本</Label>
            <p className="text-sm text-neutral-400 mb-2">
              粘贴或输入你想要优化或处理的文本内容。
            </p>
            <Textarea
              id="input-text"
              placeholder="请输入你想要优化的文本..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] bg-neutral-800 border-neutral-700 placeholder-neutral-500 text-neutral-100"
              required
            />
          </div>
          <Button
            onClick={handleGenerateClick}
            disabled={isLoading || !inputText.trim() || !selectedModel}
            className="w-full text-lg py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-neutral-600"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 生成中...</>
            ) : (
              '优化文本'
            )}
          </Button>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="output-text" className="text-lg">优化结果</Label>
            <p className="text-sm text-neutral-400 mb-2">
              AI 模型生成的优化后文本将显示在此处。
            </p>
            <Textarea
              id="output-text"
              placeholder="优化后的文本将显示在这里..."
              value={generatedText}
              readOnly
              className="min-h-[360px] bg-neutral-800 border-neutral-700 placeholder-neutral-500 text-neutral-100"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6 bg-red-900 border-red-700 text-red-100">
          <AlertTitle>发生错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
