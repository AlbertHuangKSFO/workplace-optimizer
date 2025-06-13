import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { AlertTriangle, Brain, Clock, Coffee, Zap } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            下班前精神状态检查器
          </h1>
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          辛苦了打工人！让我们来做个"精神状态大盘点"，看看你的san值还剩多少 🫠
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            完成度: {getCompletionRate()}%
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Coffee className="w-4 h-4" />
            非正式诊断
          </Badge>
        </div>
      </div>

      <Separator />

      {!result ? (
        <div className="space-y-6">
          {sanityQuestions.map((question, index) => (
            <Card key={question.id} className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
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
                      className="h-auto p-4 text-left justify-start"
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
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(answers).length < sanityQuestions.length}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  正在诊断中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  开始精神状态诊断
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-purple-200 bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Brain className="w-6 h-6" />
                您的精神状态诊断报告
              </CardTitle>
              <CardDescription>
                基于您的回答，这里是专业的"非正式"诊断结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-left leading-relaxed space-y-3 text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-foreground" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-foreground" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 text-foreground leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground" {...props} />,
                    li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 italic text-muted-foreground" {...props} />,
                    code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-4 border-border" {...props} />
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleReset} variant="outline" className="px-6">
              重新检测精神状态
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SanityCheckMeter;
