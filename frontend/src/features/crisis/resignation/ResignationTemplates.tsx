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
import { Briefcase, FileText, Loader2, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResignationTemplatesProps {
  locale: ValidLocale;
}

function ResignationTemplates({ locale }: ResignationTemplatesProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [resignationType, setResignationType] = useState<string>('better-opportunity');
  const [relationshipLevel, setRelationshipLevel] = useState<string>('positive');
  const [noticeStyle, setNoticeStyle] = useState<string>('formal');
  const [currentPosition, setCurrentPosition] = useState<string>('');
  const [workDuration, setWorkDuration] = useState<string>('');
  const [specificReasons, setSpecificReasons] = useState<string>('');
  const [handoverPlans, setHandoverPlans] = useState<string>('');
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resignationTypes = React.useMemo(() => [
    { value: 'better-opportunity', label: t('resignationTemplates.resignationTypes.better-opportunity.label'), emoji: t('resignationTemplates.resignationTypes.better-opportunity.emoji'), description: t('resignationTemplates.resignationTypes.better-opportunity.description') },
    { value: 'career-change', label: t('resignationTemplates.resignationTypes.career-change.label'), emoji: t('resignationTemplates.resignationTypes.career-change.emoji'), description: t('resignationTemplates.resignationTypes.career-change.description') },
    { value: 'personal-reasons', label: t('resignationTemplates.resignationTypes.personal-reasons.label'), emoji: t('resignationTemplates.resignationTypes.personal-reasons.emoji'), description: t('resignationTemplates.resignationTypes.personal-reasons.description') },
    { value: 'company-culture', label: t('resignationTemplates.resignationTypes.company-culture.label'), emoji: t('resignationTemplates.resignationTypes.company-culture.emoji'), description: t('resignationTemplates.resignationTypes.company-culture.description') },
    { value: 'work-life-balance', label: t('resignationTemplates.resignationTypes.work-life-balance.label'), emoji: t('resignationTemplates.resignationTypes.work-life-balance.emoji'), description: t('resignationTemplates.resignationTypes.work-life-balance.description') },
    { value: 'compensation', label: t('resignationTemplates.resignationTypes.compensation.label'), emoji: t('resignationTemplates.resignationTypes.compensation.emoji'), description: t('resignationTemplates.resignationTypes.compensation.description') },
    { value: 'growth-limitation', label: t('resignationTemplates.resignationTypes.growth-limitation.label'), emoji: t('resignationTemplates.resignationTypes.growth-limitation.emoji'), description: t('resignationTemplates.resignationTypes.growth-limitation.description') },
    { value: 'relocation', label: t('resignationTemplates.resignationTypes.relocation.label'), emoji: t('resignationTemplates.resignationTypes.relocation.emoji'), description: t('resignationTemplates.resignationTypes.relocation.description') },
  ], [t, translationsLoading]);

  const relationshipLevels = React.useMemo(() => [
    { value: 'positive', label: t('resignationTemplates.relationshipLevels.positive.label'), emoji: t('resignationTemplates.relationshipLevels.positive.emoji'), description: t('resignationTemplates.relationshipLevels.positive.description') },
    { value: 'neutral', label: t('resignationTemplates.relationshipLevels.neutral.label'), emoji: t('resignationTemplates.relationshipLevels.neutral.emoji'), description: t('resignationTemplates.relationshipLevels.neutral.description') },
    { value: 'strained', label: t('resignationTemplates.relationshipLevels.strained.label'), emoji: t('resignationTemplates.relationshipLevels.strained.emoji'), description: t('resignationTemplates.relationshipLevels.strained.description') },
    { value: 'professional', label: t('resignationTemplates.relationshipLevels.professional.label'), emoji: t('resignationTemplates.relationshipLevels.professional.emoji'), description: t('resignationTemplates.relationshipLevels.professional.description') },
  ], [t, translationsLoading]);

  const noticeStyles = React.useMemo(() => [
    { value: 'formal', label: t('resignationTemplates.noticeStyles.formal.label'), emoji: t('resignationTemplates.noticeStyles.formal.emoji'), description: t('resignationTemplates.noticeStyles.formal.description') },
    { value: 'grateful', label: t('resignationTemplates.noticeStyles.grateful.label'), emoji: t('resignationTemplates.noticeStyles.grateful.emoji'), description: t('resignationTemplates.noticeStyles.grateful.description') },
    { value: 'brief', label: t('resignationTemplates.noticeStyles.brief.label'), emoji: t('resignationTemplates.noticeStyles.brief.emoji'), description: t('resignationTemplates.noticeStyles.brief.description') },
    { value: 'detailed', label: t('resignationTemplates.noticeStyles.detailed.label'), emoji: t('resignationTemplates.noticeStyles.detailed.emoji'), description: t('resignationTemplates.noticeStyles.detailed.description') },
    { value: 'diplomatic', label: t('resignationTemplates.noticeStyles.diplomatic.label'), emoji: t('resignationTemplates.noticeStyles.diplomatic.emoji'), description: t('resignationTemplates.noticeStyles.diplomatic.description') },
    { value: 'honest', label: t('resignationTemplates.noticeStyles.honest.label'), emoji: t('resignationTemplates.noticeStyles.honest.emoji'), description: t('resignationTemplates.noticeStyles.honest.description') },
  ], [t, translationsLoading]);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPosition.trim()) {
      setError(t('resignationTemplates.emptyPositionError'));
      setGeneratedTemplate('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedTemplate('');

    const selectedResignation = resignationTypes.find(r => r.value === resignationType);
    const selectedRelationship = relationshipLevels.find(r => r.value === relationshipLevel);
    const selectedStyle = noticeStyles.find(s => s.value === noticeStyle);

    const userPrompt = locale === 'zh-CN' ? `
离职原因：${selectedResignation?.label} - ${selectedResignation?.description}
关系状况：${selectedRelationship?.label} - ${selectedRelationship?.description}
通知风格：${selectedStyle?.label} - ${selectedStyle?.description}

当前职位：${currentPosition}
${workDuration.trim() ? `工作时长：${workDuration}` : ''}
${specificReasons.trim() ? `具体原因：${specificReasons}` : ''}
${handoverPlans.trim() ? `交接计划：${handoverPlans}` : ''}

请生成一份专业、得体的离职申请或通知文案，包括邮件标题和正文内容。
` : `
Resignation Reason: ${selectedResignation?.label} - ${selectedResignation?.description}
Relationship Status: ${selectedRelationship?.label} - ${selectedRelationship?.description}
Notice Style: ${selectedStyle?.label} - ${selectedStyle?.description}

Current Position: ${currentPosition}
${workDuration.trim() ? `Work Duration: ${workDuration}` : ''}
${specificReasons.trim() ? `Specific Reasons: ${specificReasons}` : ''}
${handoverPlans.trim() ? `Handover Plans: ${handoverPlans}` : ''}

Please generate a professional and appropriate resignation application or notice, including email subject and content.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'resignation-templates',
          language: locale,
        }),
      });

      if (!response.ok) {
        const defaultErrorMessage = locale === 'zh-CN'
          ? '文案生成失败，可能是HR顾问在思考更好的表达方式。'
          : 'Template generation failed, the HR consultant might be thinking of better expressions.';
        const errorData = await response.json().catch(() => ({ message: defaultErrorMessage }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedTemplate(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        const unexpectedResponseError = locale === 'zh-CN'
          ? 'AI返回的文案格式有误，HR顾问可能在重新组织语言...📝'
          : 'The AI template format is incorrect, the HR consultant might be reorganizing the language...📝';
        setError(unexpectedResponseError);
      }
    } catch (e) {
      console.error('Failed to generate template:', e);
      const unknownError = locale === 'zh-CN'
        ? '生成文案时发生未知错误，职业规划师还需要更多时间！💼'
        : 'An unknown error occurred while generating the template, the career planner needs more time!💼';
      setError(e instanceof Error ? e.message : unknownError);
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <LogOut className="w-8 h-8 text-purple-500 dark:text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('resignationTemplates.title')}</h1>
        <Briefcase className="w-8 h-8 text-purple-500 dark:text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="resignationType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('resignationTemplates.resignationTypeLabel')}
            </Label>
            <Select value={resignationType} onValueChange={setResignationType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}>
                <SelectValue placeholder={t('resignationTemplates.resignationTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {resignationTypes.map(resignation => (
                  <SelectItem
                    key={resignation.value}
                    value={resignation.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-purple-100 dark:focus:bg-purple-700/50",
                      "data-[state=checked]:bg-purple-200 dark:data-[state=checked]:bg-purple-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{resignation.emoji} {resignation.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{resignation.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="relationshipLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('resignationTemplates.relationshipLabel')}
            </Label>
            <Select value={relationshipLevel} onValueChange={setRelationshipLevel}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}>
                <SelectValue placeholder={t('resignationTemplates.relationshipPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {relationshipLevels.map(relationship => (
                  <SelectItem
                    key={relationship.value}
                    value={relationship.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-purple-100 dark:focus:bg-purple-700/50",
                      "data-[state=checked]:bg-purple-200 dark:data-[state=checked]:bg-purple-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{relationship.emoji} {relationship.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{relationship.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="noticeStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('resignationTemplates.styleLabel')}
            </Label>
            <Select value={noticeStyle} onValueChange={setNoticeStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}>
                <SelectValue placeholder={t('resignationTemplates.stylePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {noticeStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-purple-100 dark:focus:bg-purple-700/50",
                      "data-[state=checked]:bg-purple-200 dark:data-[state=checked]:bg-purple-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {style.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentPosition" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('resignationTemplates.positionLabel')}
            </Label>
            <Input
              id="currentPosition"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              placeholder={t('resignationTemplates.positionPlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="workDuration" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('resignationTemplates.durationLabel')}
            </Label>
            <Input
              id="workDuration"
              value={workDuration}
              onChange={(e) => setWorkDuration(e.target.value)}
              placeholder={t('resignationTemplates.durationPlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="specificReasons" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('resignationTemplates.reasonsLabel')}
          </Label>
          <Textarea
            id="specificReasons"
            value={specificReasons}
            onChange={(e) => setSpecificReasons(e.target.value)}
            placeholder={t('resignationTemplates.reasonsPlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
            )}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="handoverPlans" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('resignationTemplates.handoverLabel')}
          </Label>
          <Textarea
            id="handoverPlans"
            value={handoverPlans}
            onChange={(e) => setHandoverPlans(e.target.value)}
            placeholder={t('resignationTemplates.handoverPlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
            )}
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('resignationTemplates.generating')}</>
          ) : (
            <><FileText className="mr-2 h-4 w-4" /> {t('resignationTemplates.generateButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('resignationTemplates.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedTemplate && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-purple-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('resignationTemplates.loadingText')}</p>
        </div>
      )}

      {generatedTemplate && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> {t('resignationTemplates.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedTemplate}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ResignationTemplates;
