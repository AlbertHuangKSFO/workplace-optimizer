'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { CheckSquare, FileText, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const meetingTypes = [
  { value: 'standup', label: '站会/晨会', emoji: '☀️', description: '日常团队同步会议' },
  { value: 'project-review', label: '项目评审', emoji: '📊', description: '项目进度和成果评审' },
  { value: 'brainstorming', label: '头脑风暴', emoji: '💡', description: '创意讨论和方案设计' },
  { value: 'decision-making', label: '决策会议', emoji: '⚖️', description: '重要决策讨论和确定' },
  { value: 'planning', label: '规划会议', emoji: '📅', description: '项目规划和任务分配' },
  { value: 'retrospective', label: '复盘会议', emoji: '🔄', description: '项目回顾和经验总结' },
  { value: 'client-meeting', label: '客户会议', emoji: '🤝', description: '与客户的沟通会议' },
  { value: 'training', label: '培训会议', emoji: '📚', description: '知识分享和培训' },
];

const organizationStyles = [
  { value: 'structured', label: '结构化整理', emoji: '📋', description: '按议题、决策、行动项分类' },
  { value: 'timeline', label: '时间线整理', emoji: '⏰', description: '按时间顺序梳理会议流程' },
  { value: 'action-focused', label: '行动导向', emoji: '🎯', description: '突出行动项和责任人' },
  { value: 'summary', label: '摘要总结', emoji: '📝', description: '提炼关键信息和要点' },
  { value: 'detailed', label: '详细记录', emoji: '📄', description: '保留完整的讨论细节' },
  { value: 'executive', label: '高管摘要', emoji: '👔', description: '适合高层汇报的简洁版本' },
];

const outputFormats = [
  { value: 'markdown', label: 'Markdown格式', emoji: '📝', description: '适合文档和协作平台' },
  { value: 'email', label: '邮件格式', emoji: '📧', description: '适合邮件发送的格式' },
  { value: 'presentation', label: '演示文稿', emoji: '📊', description: '适合PPT展示的要点' },
  { value: 'task-list', label: '任务清单', emoji: '✅', description: '突出任务和截止日期' },
  { value: 'report', label: '正式报告', emoji: '📋', description: '正式的会议纪要格式' },
];

function MeetingNotesOrganizer(): React.JSX.Element {
  const [meetingType, setMeetingType] = useState<string>('project-review');
  const [organizationStyle, setOrganizationStyle] = useState<string>('structured');
  const [outputFormat, setOutputFormat] = useState<string>('markdown');
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [participants, setParticipants] = useState<string>('');
  const [rawNotes, setRawNotes] = useState<string>('');
  const [keyDecisions, setKeyDecisions] = useState<string>('');
  const [actionItems, setActionItems] = useState<string>('');
  const [organizedNotes, setOrganizedNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rawNotes.trim()) {
      setError('请输入会议原始记录！');
      setOrganizedNotes('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrganizedNotes('');

    const selectedMeetingType = meetingTypes.find(m => m.value === meetingType);
    const selectedStyle = organizationStyles.find(s => s.value === organizationStyle);
    const selectedFormat = outputFormats.find(f => f.value === outputFormat);

    const userPrompt = `
会议类型：${selectedMeetingType?.label} - ${selectedMeetingType?.description}
整理风格：${selectedStyle?.label} - ${selectedStyle?.description}
输出格式：${selectedFormat?.label} - ${selectedFormat?.description}

${meetingTitle.trim() ? `会议主题：${meetingTitle}` : ''}
${meetingDate.trim() ? `会议时间：${meetingDate}` : ''}
${participants.trim() ? `参会人员：${participants}` : ''}

原始会议记录：
${rawNotes}

${keyDecisions.trim() ? `关键决策：${keyDecisions}` : ''}
${actionItems.trim() ? `行动项：${actionItems}` : ''}

请将这些原始会议记录整理成清晰、结构化的会议纪要。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'meeting-notes-organizer',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '会议记录整理失败，可能是会议秘书在仔细梳理内容。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setOrganizedNotes(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的整理结果格式有误，会议秘书可能在重新组织内容...📝');
      }
    } catch (e) {
      console.error('Failed to organize meeting notes:', e);
      setError(e instanceof Error ? e.message : '整理会议记录时发生未知错误，会议纪要还需要更多时间！📋');
    }

    setIsLoading(false);
  }

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <FileText className="w-8 h-8 text-indigo-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">会议记录智能整理</h1>
        <CheckSquare className="w-8 h-8 text-indigo-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meetingType" className="block text-sm font-medium text-neutral-300 mb-2">
              会议类型：
            </Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择会议类型..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {meetingTypes.map(meeting => (
                  <SelectItem key={meeting.value} value={meeting.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    <div className="flex flex-col">
                      <span>{meeting.emoji} {meeting.label}</span>
                      <span className="text-xs text-neutral-400">{meeting.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="organizationStyle" className="block text-sm font-medium text-neutral-300 mb-2">
              整理风格：
            </Label>
            <Select value={organizationStyle} onValueChange={setOrganizationStyle}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择整理风格..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {organizationStyles.map(style => (
                  <SelectItem key={style.value} value={style.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    <div className="flex flex-col">
                      <span>{style.emoji} {style.label}</span>
                      <span className="text-xs text-neutral-400">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="outputFormat" className="block text-sm font-medium text-neutral-300 mb-2">
              输出格式：
            </Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500">
                <SelectValue placeholder="选择输出格式..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                {outputFormats.map(format => (
                  <SelectItem key={format.value} value={format.value} className="hover:bg-neutral-700 focus:bg-sky-700">
                    <div className="flex flex-col">
                      <span>{format.emoji} {format.label}</span>
                      <span className="text-xs text-neutral-400">{format.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meetingTitle" className="block text-sm font-medium text-neutral-300 mb-2">
              会议主题（选填）：
            </Label>
            <Input
              id="meetingTitle"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="例如：产品规划讨论会、周度项目评审..."
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <Label htmlFor="meetingDate" className="block text-sm font-medium text-neutral-300 mb-2">
              会议时间（选填）：
            </Label>
            <Input
              id="meetingDate"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              placeholder="例如：2024-01-15 14:00-15:30"
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <Label htmlFor="participants" className="block text-sm font-medium text-neutral-300 mb-2">
              参会人员（选填）：
            </Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="例如：张三、李四、王五..."
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="rawNotes" className="block text-sm font-medium text-neutral-300 mb-2">
            原始会议记录：
          </Label>
          <Textarea
            id="rawNotes"
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="粘贴或输入原始的会议记录、讨论内容、语音转文字结果等..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[150px]"
            rows={6}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="keyDecisions" className="block text-sm font-medium text-neutral-300 mb-2">
              关键决策（选填）：
            </Label>
            <Textarea
              id="keyDecisions"
              value={keyDecisions}
              onChange={(e) => setKeyDecisions(e.target.value)}
              placeholder="会议中做出的重要决策和结论..."
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="actionItems" className="block text-sm font-medium text-neutral-300 mb-2">
              行动项（选填）：
            </Label>
            <Textarea
              id="actionItems"
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="需要跟进的任务、责任人、截止时间等..."
              className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
              rows={3}
            />
          </div>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 会议秘书正在整理记录...</>
          ) : (
            <><CheckSquare className="mr-2 h-4 w-4" /> 开始智能整理！</>
          )}
        </Button>
      </form>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">整理失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !organizedNotes && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
          <p className="text-neutral-400">AI会议秘书正在智能整理您的会议记录...📝✨</p>
        </div>
      )}

      {organizedNotes && !isLoading && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-indigo-400 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> 整理后的会议纪要
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{organizedNotes}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingNotesOrganizer;
