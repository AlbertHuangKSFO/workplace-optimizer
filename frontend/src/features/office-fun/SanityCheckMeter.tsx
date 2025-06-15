'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AlertTriangle, Brain, Clock, Coffee, Lightbulb, RefreshCcw, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SanityQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; emoji: string }[];
}

const sanityQuestions: SanityQuestion[] = [
  {
    id: 'energy',
    question: '现在的精神状态如何？',
    options: [
      { value: 'zombie', label: '行尸走肉模式', emoji: '🧟‍♀️' },
      { value: 'tired', label: '疲惫但清醒', emoji: '😴' },
      { value: 'normal', label: '还算正常', emoji: '😐' },
      { value: 'energetic', label: '精力充沛', emoji: '⚡' },
      { value: 'hyperactive', label: '亢奋到想跳舞', emoji: '🕺' }
    ]
  },
  {
    id: 'workload',
    question: '今天的工作量感觉如何？',
    options: [
      { value: 'overwhelming', label: '被工作淹没了', emoji: '🌊' },
      { value: 'heavy', label: '压力山大', emoji: '⛰️' },
      { value: 'moderate', label: '刚好合适', emoji: '👌' },
      { value: 'light', label: '轻松愉快', emoji: '🎈' },
      { value: 'bored', label: '无聊到发霉', emoji: '🦠' }
    ]
  },
  {
    id: 'mood',
    question: '心情指数是多少？',
    options: [
      { value: 'depressed', label: '想找个角落哭', emoji: '😭' },
      { value: 'frustrated', label: '烦躁不安', emoji: '😤' },
      { value: 'neutral', label: '平静如水', emoji: '😑' },
      { value: 'happy', label: '心情不错', emoji: '😊' },
      { value: 'ecstatic', label: '开心到飞起', emoji: '🚀' }
    ]
  },
  {
    id: 'focus',
    question: '注意力集中程度？',
    options: [
      { value: 'scattered', label: '思绪飞到外太空', emoji: '🛸' },
      { value: 'distracted', label: '容易分心', emoji: '🦋' },
      { value: 'okay', label: '还算专注', emoji: '🎯' },
      { value: 'focused', label: '专注力MAX', emoji: '🔍' },
      { value: 'laser', label: '激光般精准', emoji: '🔥' }
    ]
  }
];

function SanityCheckMeter(): React.JSX.Element {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < sanityQuestions.length) {
      setError('请回答所有问题才能获得精神状态诊断！');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userInput = sanityQuestions.map(q => {
        const selectedOption = q.options.find(opt => opt.value === answers[q.id]);
        return `${q.question} ${selectedOption?.emoji} ${selectedOption?.label}`;
      }).join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          toolId: 'sanity-check-meter',
          language: 'zh'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.assistantMessage || '诊断结果生成失败');
    } catch (err: any) {
      console.error('精神状态检查失败:', err);
      setError(`诊断失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult('');
    setError('');
  };

  const getCompletionRate = () => {
    return Math.round((Object.keys(answers).length / sanityQuestions.length) * 100);
  };

  return (
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100")}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            下班前精神状态检查器
          </h1>
          <AlertTriangle className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          辛苦了打工人！让我们来做个"精神状态大盘点"，看看你的san值还剩多少 🫠
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className={cn("flex items-center gap-1", "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300")}>
            <Clock className="w-4 h-4" />
            完成度: {getCompletionRate()}%
          </Badge>
          <Badge variant="outline" className={cn("flex items-center gap-1", "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300")}>
            <Coffee className="w-4 h-4" />
            非正式诊断
          </Badge>
        </div>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {!result ? (
        <div className="space-y-6">
          {sanityQuestions.map((question, index) => (
            <Card key={question.id} className={cn(
              "border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300"
                  )}>
                    {index + 1}
                  </span>
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {question.options.map((option) => (
                    <Button
                      key={option.value}
                      variant={answers[question.id] === option.value ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 text-left justify-start",
                        answers[question.id] === option.value ?
                          "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white dark:text-white" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={() => handleAnswerChange(question.id, option.value)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {error && (
            <Card className={cn("border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/20")}>
              <CardContent className="pt-6">
                <p className="text-red-700 dark:text-red-400 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(answers).length < sanityQuestions.length}
              className={cn(
                "px-8 py-3 text-lg",
                "bg-purple-600 hover:bg-purple-700 text-white",
                "dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white",
                "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 animate-spin" />
                  AI诊断中...
                </div>
              ) : (
                '获取精神诊断'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Card className={cn("shadow-xl", "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800")}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Lightbulb className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300">您的精神状态诊断报告</CardTitle>
            </div>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              仅供娱乐，如有不适请立即停止摸鱼并认真工作 (或看医生)。
            </CardDescription>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300">
                AI 生成结果
              </Badge>
              <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                Sanity Level: Over 9000?!
              </Badge>
            </div>
          </CardHeader>

          <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800" />

          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </CardContent>

          <Separator className="mb-4 bg-neutral-200 dark:bg-neutral-800" />

          <div className="p-6 text-center">
            <Button onClick={handleReset} variant="outline" className={cn(
              "px-6 py-2",
              "border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30"
            )}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              再测一次
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SanityCheckMeter;
