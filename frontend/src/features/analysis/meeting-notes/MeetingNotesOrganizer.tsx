'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { CheckSquare, FileText, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingNotesOrganizerProps {
  locale: ValidLocale;
}

function MeetingNotesOrganizer({ locale }: MeetingNotesOrganizerProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
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

  // 会议类型选项
  const meetingTypes = useMemo(() => [
    { value: 'standup', emoji: '☀️' },
    { value: 'project-review', emoji: '📊' },
    { value: 'brainstorming', emoji: '💡' },
    { value: 'decision-making', emoji: '⚖️' },
    { value: 'planning', emoji: '📅' },
    { value: 'retrospective', emoji: '🔄' },
    { value: 'client-meeting', emoji: '🤝' },
    { value: 'training', emoji: '📚' },
  ], []);

  // 整理风格选项
  const organizationStyles = useMemo(() => [
    { value: 'structured', emoji: '📋' },
    { value: 'timeline', emoji: '⏰' },
    { value: 'action-focused', emoji: '🎯' },
    { value: 'summary', emoji: '📝' },
    { value: 'detailed', emoji: '📄' },
    { value: 'executive', emoji: '👔' },
  ], []);

  // 输出格式选项
  const outputFormats = useMemo(() => [
    { value: 'markdown', emoji: '📝' },
    { value: 'email', emoji: '📧' },
    { value: 'presentation', emoji: '📊' },
    { value: 'task-list', emoji: '✅' },
    { value: 'report', emoji: '📋' },
  ], []);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rawNotes.trim()) {
      setError(t('meetingNotesOrganizer.requiredField'));
      setOrganizedNotes('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrganizedNotes('');

    const meetingTypeLabel = t(`meetingNotesOrganizer.meetingTypes.${meetingType}.label`);
    const meetingTypeDesc = t(`meetingNotesOrganizer.meetingTypes.${meetingType}.description`);
    const styleLabel = t(`meetingNotesOrganizer.organizationStyles.${organizationStyle}.label`);
    const styleDesc = t(`meetingNotesOrganizer.organizationStyles.${organizationStyle}.description`);
    const formatLabel = t(`meetingNotesOrganizer.outputFormats.${outputFormat}.label`);
    const formatDesc = t(`meetingNotesOrganizer.outputFormats.${outputFormat}.description`);

    const userPrompt = locale === 'zh-CN' ? `
会议类型：${meetingTypeLabel} - ${meetingTypeDesc}
整理风格：${styleLabel} - ${styleDesc}
输出格式：${formatLabel} - ${formatDesc}

${meetingTitle.trim() ? `会议主题：${meetingTitle}` : ''}
${meetingDate.trim() ? `会议时间：${meetingDate}` : ''}
${participants.trim() ? `参会人员：${participants}` : ''}

原始会议记录：
${rawNotes}

${keyDecisions.trim() ? `关键决策：${keyDecisions}` : ''}
${actionItems.trim() ? `行动项：${actionItems}` : ''}

请将这些原始会议记录整理成清晰、结构化的会议纪要。
` : `
Meeting Type: ${meetingTypeLabel} - ${meetingTypeDesc}
Organization Style: ${styleLabel} - ${styleDesc}
Output Format: ${formatLabel} - ${formatDesc}

${meetingTitle.trim() ? `Meeting Topic: ${meetingTitle}` : ''}
${meetingDate.trim() ? `Meeting Time: ${meetingDate}` : ''}
${participants.trim() ? `Participants: ${participants}` : ''}

Raw Meeting Notes:
${rawNotes}

${keyDecisions.trim() ? `Key Decisions: ${keyDecisions}` : ''}
${actionItems.trim() ? `Action Items: ${actionItems}` : ''}

Please organize these raw meeting notes into clear, structured meeting minutes.
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
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('meetingNotesOrganizer.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setOrganizedNotes(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('meetingNotesOrganizer.formatError'));
      }
    } catch (e) {
      console.error('Failed to organize meeting notes:', e);
      setError(e instanceof Error ? e.message : t('meetingNotesOrganizer.unknownError'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <FileText className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('meetingNotesOrganizer.title')}</h1>
        <CheckSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meetingType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.meetingTypeLabel')}
            </Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}>
                <SelectValue placeholder={t('meetingNotesOrganizer.meetingTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {meetingTypes.map(meeting => (
                  <SelectItem
                    key={meeting.value}
                    value={meeting.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-indigo-100 dark:focus:bg-indigo-700/50",
                      "data-[state=checked]:bg-indigo-200 dark:data-[state=checked]:bg-indigo-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{meeting.emoji} {t(`meetingNotesOrganizer.meetingTypes.${meeting.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`meetingNotesOrganizer.meetingTypes.${meeting.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="organizationStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.organizationStyleLabel')}
            </Label>
            <Select value={organizationStyle} onValueChange={setOrganizationStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}>
                <SelectValue placeholder={t('meetingNotesOrganizer.organizationStylePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {organizationStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-indigo-100 dark:focus:bg-indigo-700/50",
                      "data-[state=checked]:bg-indigo-200 dark:data-[state=checked]:bg-indigo-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {t(`meetingNotesOrganizer.organizationStyles.${style.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`meetingNotesOrganizer.organizationStyles.${style.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="outputFormat" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.outputFormatLabel')}
            </Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}>
                <SelectValue placeholder={t('meetingNotesOrganizer.outputFormatPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {outputFormats.map(format => (
                  <SelectItem
                    key={format.value}
                    value={format.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-indigo-100 dark:focus:bg-indigo-700/50",
                      "data-[state=checked]:bg-indigo-200 dark:data-[state=checked]:bg-indigo-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{format.emoji} {t(`meetingNotesOrganizer.outputFormats.${format.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`meetingNotesOrganizer.outputFormats.${format.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meetingTitle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.meetingTitleLabel')}
            </Label>
            <Input
              id="meetingTitle"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder={t('meetingNotesOrganizer.meetingTitlePlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="meetingDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.meetingDateLabel')}
            </Label>
            <Input
              id="meetingDate"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              placeholder={t('meetingNotesOrganizer.meetingDatePlaceholder')}
              type="text"
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="participants" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.participantsLabel')}
            </Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder={t('meetingNotesOrganizer.participantsPlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="rawNotes" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('meetingNotesOrganizer.rawNotesLabel')}
          </Label>
          <Textarea
            id="rawNotes"
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder={t('meetingNotesOrganizer.rawNotesPlaceholder')}
            className={cn(
              "w-full min-h-[150px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
            )}
            rows={6}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="keyDecisions" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.keyDecisionsLabel')}
            </Label>
            <Textarea
              id="keyDecisions"
              value={keyDecisions}
              onChange={(e) => setKeyDecisions(e.target.value)}
              placeholder={t('meetingNotesOrganizer.keyDecisionsPlaceholder')}
              className={cn(
                "w-full min-h-[60px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="actionItems" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('meetingNotesOrganizer.actionItemsLabel')}
            </Label>
            <Textarea
              id="actionItems"
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder={t('meetingNotesOrganizer.actionItemsPlaceholder')}
              className={cn(
                "w-full min-h-[60px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              )}
              rows={2}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('meetingNotesOrganizer.organizing')}</>
          ) : (
            <><FileText className="mr-2 h-4 w-4" /> {t('meetingNotesOrganizer.organizeButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('meetingNotesOrganizer.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !organizedNotes && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 dark:text-indigo-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('meetingNotesOrganizer.loadingMessage')}</p>
        </div>
      )}

      {organizedNotes && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-indigo-600 dark:text-indigo-400 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" /> {t('meetingNotesOrganizer.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{organizedNotes}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingNotesOrganizer;
