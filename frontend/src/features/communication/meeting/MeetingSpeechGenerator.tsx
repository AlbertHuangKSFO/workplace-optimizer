'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, Users } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const speechTypes = [
  { value: 'opening', label: '开场白/欢迎词' },
  { value: 'summary', label: '总结发言' },
  { value: 'proposal', label: '提案/建议' },
  { value: 'question', label: '提问/质疑' },
  { value: 'opposition', label: '反对意见' },
  { value: 'support', label: '支持/赞同' },
  { value: 'closing', label: '结束语' },
  { value: 'update', label: '进度汇报' },
];

const speechDurations = [
  { value: '1', label: '1分钟（简短发言）' },
  { value: '3', label: '3分钟（标准发言）' },
  { value: '5', label: '5分钟（详细发言）' },
  { value: '10', label: '10分钟（深度发言）' },
];

function MeetingSpeechGenerator(): React.JSX.Element {
  const [meetingTopic, setMeetingTopic] = useState<string>('');
  const [speechType, setSpeechType] = useState<string>('opening');
  const [duration, setDuration] = useState<string>('3');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [generatedSpeech, setGeneratedSpeech] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!meetingTopic.trim()) {
      setError('请输入会议主题！');
      setGeneratedSpeech('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedSpeech('');

    const selectedType = speechTypes.find(t => t.value === speechType);
    const selectedDuration = speechDurations.find(d => d.value === duration);

    let userPrompt = `请为我生成一个${selectedDuration?.label}的${selectedType?.label}，会议主题是：${meetingTopic}`;
    if (additionalInfo.trim()) {
      userPrompt += `\n\n补充信息：${additionalInfo}`;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'meeting-speech-generator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '发言稿生成失败，可能是AI的演讲课程还在进修中。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedSpeech(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for speech generation:', data);
        setError('AI返回的发言稿有点奇怪，我暂时理解不了...🎤');
      }
    } catch (e) {
      console.error('Failed to generate speech:', e);
      setError(e instanceof Error ? e.message : '生成发言稿时发生未知错误，我的演讲助手失声了！🔇');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <Users className="w-8 h-8 text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">会议发言生成器</h1>
        <Users className="w-8 h-8 text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="meetingTopic" className="block text-sm font-medium text-neutral-300 mb-2">
            会议主题：
          </Label>
          <Input
            id="meetingTopic"
            value={meetingTopic}
            onChange={(e) => setMeetingTopic(e.target.value)}
            placeholder="例如：Q4季度业绩回顾、新产品发布计划..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speechType" className="block text-sm font-medium text-neutral-300 mb-2">
              发言类型：
            </Label>
            <Select value={speechType} onValueChange={setSpeechType}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择发言类型..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {speechTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration" className="block text-sm font-medium text-neutral-300 mb-2">
              发言时长：
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择发言时长..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {speechDurations.map(dur => (
                  <SelectItem key={dur.value} value={dur.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="additionalInfo" className="block text-sm font-medium text-neutral-300 mb-2">
            补充信息（选填）：
          </Label>
          <Textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="例如：需要强调的重点、特殊要求、背景信息等..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
            rows={3}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI正在撰写发言稿...
            </>
          ) : (
            <><Mic className="mr-2 h-4 w-4" /> 生成发言稿！
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">生成失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedSpeech && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
          <p className="text-neutral-400">AI演讲大师正在为您量身定制发言稿...🎯</p>
        </div>
      )}

      {generatedSpeech && !isLoading && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Mic className="w-5 h-5 mr-2" /> 您的专属发言稿：
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedSpeech}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingSpeechGenerator;
