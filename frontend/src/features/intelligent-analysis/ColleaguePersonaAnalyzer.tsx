'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, HelpCircle, Loader2, MessageSquarePlus, RotateCcw, Sparkles } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ColleaguePersonaAnalyzerProps {
  locale?: ValidLocale;
}

interface PersonaDimensionOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const ColleaguePersonaAnalyzer: React.FC<ColleaguePersonaAnalyzerProps> = ({ locale = 'zh-CN' }) => {
  const { t, loading: translationsLoading } = useTranslations(locale);

  // State for selected dimension options
  const [selectedCommStyle, setSelectedCommStyle] = useState<string>('');
  const [selectedTeamRole, setSelectedTeamRole] = useState<string>('');
  const [selectedPressureReaction, setSelectedPressureReaction] = useState<string>('');
  const [selectedConflictApproach, setSelectedConflictApproach] = useState<string>('');
  const [selectedTaskMgmtStyle, setSelectedTaskMgmtStyle] = useState<string>('');
  const [selectedAdaptability, setSelectedAdaptability] = useState<string>('');
  const [selectedLearningAttitude, setSelectedLearningAttitude] = useState<string>('');

  // Existing states
  const [colleagueDescription, setColleagueDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create translated option arrays using useMemo for performance
  const communicationStyles: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'comm_direct', label: t('colleaguePersonaAnalyzer.communicationStyles.comm_direct'), emoji: '🎯', description: t('colleaguePersonaAnalyzer.communicationStyles.comm_direct_desc') },
    { id: 'comm_diplomatic', label: t('colleaguePersonaAnalyzer.communicationStyles.comm_diplomatic'), emoji: '🕊️', description: t('colleaguePersonaAnalyzer.communicationStyles.comm_diplomatic_desc') },
    { id: 'comm_logical', label: t('colleaguePersonaAnalyzer.communicationStyles.comm_logical'), emoji: '🧠', description: t('colleaguePersonaAnalyzer.communicationStyles.comm_logical_desc') },
    { id: 'comm_expressive', label: t('colleaguePersonaAnalyzer.communicationStyles.comm_expressive'), emoji: '🗣️', description: t('colleaguePersonaAnalyzer.communicationStyles.comm_expressive_desc') },
    { id: 'comm_reserved', label: t('colleaguePersonaAnalyzer.communicationStyles.comm_reserved'), emoji: '🤐', description: t('colleaguePersonaAnalyzer.communicationStyles.comm_reserved_desc') },
  ], [t]);

  const teamRoles: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'role_leader', label: t('colleaguePersonaAnalyzer.teamRoles.role_leader'), emoji: '👑', description: t('colleaguePersonaAnalyzer.teamRoles.role_leader_desc') },
    { id: 'role_innovator', label: t('colleaguePersonaAnalyzer.teamRoles.role_innovator'), emoji: '💡', description: t('colleaguePersonaAnalyzer.teamRoles.role_innovator_desc') },
    { id: 'role_executor', label: t('colleaguePersonaAnalyzer.teamRoles.role_executor'), emoji: '🛠️', description: t('colleaguePersonaAnalyzer.teamRoles.role_executor_desc') },
    { id: 'role_supporter', label: t('colleaguePersonaAnalyzer.teamRoles.role_supporter'), emoji: '🤝', description: t('colleaguePersonaAnalyzer.teamRoles.role_supporter_desc') },
    { id: 'role_detailer', label: t('colleaguePersonaAnalyzer.teamRoles.role_detailer'), emoji: '🔍', description: t('colleaguePersonaAnalyzer.teamRoles.role_detailer_desc') },
    { id: 'role_independent', label: t('colleaguePersonaAnalyzer.teamRoles.role_independent'), emoji: '🚶', description: t('colleaguePersonaAnalyzer.teamRoles.role_independent_desc') },
  ], [t]);

  const pressureReactions: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'pressure_calm', label: t('colleaguePersonaAnalyzer.pressureReactions.pressure_calm'), emoji: '🧘', description: t('colleaguePersonaAnalyzer.pressureReactions.pressure_calm_desc') },
    { id: 'pressure_proactive', label: t('colleaguePersonaAnalyzer.pressureReactions.pressure_proactive'), emoji: '🚀', description: t('colleaguePersonaAnalyzer.pressureReactions.pressure_proactive_desc') },
    { id: 'pressure_anxious', label: t('colleaguePersonaAnalyzer.pressureReactions.pressure_anxious'), emoji: '😟', description: t('colleaguePersonaAnalyzer.pressureReactions.pressure_anxious_desc') },
    { id: 'pressure_seeker', label: t('colleaguePersonaAnalyzer.pressureReactions.pressure_seeker'), emoji: '🙋', description: t('colleaguePersonaAnalyzer.pressureReactions.pressure_seeker_desc') },
    { id: 'pressure_avoidant', label: t('colleaguePersonaAnalyzer.pressureReactions.pressure_avoidant'), emoji: '🙈', description: t('colleaguePersonaAnalyzer.pressureReactions.pressure_avoidant_desc') },
  ], [t]);

  const conflictApproaches: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'conflict_direct', label: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_direct'), emoji: '⚔️', description: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_direct_desc') },
    { id: 'conflict_collaborative', label: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_collaborative'), emoji: '🧑‍🤝‍🧑', description: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_collaborative_desc') },
    { id: 'conflict_compromising', label: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_compromising'), emoji: '⚖️', description: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_compromising_desc') },
    { id: 'conflict_avoiding', label: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_avoiding'), emoji: '🙈', description: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_avoiding_desc') },
    { id: 'conflict_assertive', label: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_assertive'), emoji: '💪', description: t('colleaguePersonaAnalyzer.conflictApproaches.conflict_assertive_desc') },
  ], [t]);

  const taskManagementStyles: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'task_planner', label: t('colleaguePersonaAnalyzer.taskManagementStyles.task_planner'), emoji: '🗓️', description: t('colleaguePersonaAnalyzer.taskManagementStyles.task_planner_desc') },
    { id: 'task_flexible', label: t('colleaguePersonaAnalyzer.taskManagementStyles.task_flexible'), emoji: '🤸', description: t('colleaguePersonaAnalyzer.taskManagementStyles.task_flexible_desc') },
    { id: 'task_detail_oriented', label: t('colleaguePersonaAnalyzer.taskManagementStyles.task_detail_oriented'), emoji: '🔬', description: t('colleaguePersonaAnalyzer.taskManagementStyles.task_detail_oriented_desc') },
    { id: 'task_result_driven', label: t('colleaguePersonaAnalyzer.taskManagementStyles.task_result_driven'), emoji: '🏁', description: t('colleaguePersonaAnalyzer.taskManagementStyles.task_result_driven_desc') },
    { id: 'task_procrastinator', label: t('colleaguePersonaAnalyzer.taskManagementStyles.task_procrastinator'), emoji: '⏳', description: t('colleaguePersonaAnalyzer.taskManagementStyles.task_procrastinator_desc') },
  ], [t]);

  const adaptabilityToChanges: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'change_embracer', label: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_embracer'), emoji: '🤗', description: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_embracer_desc') },
    { id: 'change_cautious', label: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_cautious'), emoji: '🧐', description: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_cautious_desc') },
    { id: 'change_resistant', label: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_resistant'), emoji: '🙅', description: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_resistant_desc') },
    { id: 'change_passive', label: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_passive'), emoji: '😶', description: t('colleaguePersonaAnalyzer.adaptabilityToChanges.change_passive_desc') },
  ], [t]);

  const learningAttitudes: PersonaDimensionOption[] = React.useMemo(() => [
    { id: 'learn_proactive', label: t('colleaguePersonaAnalyzer.learningAttitudes.learn_proactive'), emoji: '🌟', description: t('colleaguePersonaAnalyzer.learningAttitudes.learn_proactive_desc') },
    { id: 'learn_receptive', label: t('colleaguePersonaAnalyzer.learningAttitudes.learn_receptive'), emoji: '💡', description: t('colleaguePersonaAnalyzer.learningAttitudes.learn_receptive_desc') },
    { id: 'learn_practical', label: t('colleaguePersonaAnalyzer.learningAttitudes.learn_practical'), emoji: '🔧', description: t('colleaguePersonaAnalyzer.learningAttitudes.learn_practical_desc') },
    { id: 'learn_complacent', label: t('colleaguePersonaAnalyzer.learningAttitudes.learn_complacent'), emoji: '😌', description: t('colleaguePersonaAnalyzer.learningAttitudes.learn_complacent_desc') },
  ], [t]);

  const guidingPrompts = React.useMemo(() => {
    const prompts = t('colleaguePersonaAnalyzer.guidingPrompts', { returnObjects: true });
    return Array.isArray(prompts) ? prompts : [];
  }, [t]);

  const handleGuidingPromptClick = (prompt: string) => {
    setColleagueDescription((prev) => prev.trim() ? `${prev}\n\n${prompt} ` : `${prompt} `);
  };

  const resetForm = () => {
    setSelectedCommStyle('');
    setSelectedTeamRole('');
    setSelectedPressureReaction('');
    setSelectedConflictApproach('');
    setSelectedTaskMgmtStyle('');
    setSelectedAdaptability('');
    setSelectedLearningAttitude('');
    setColleagueDescription('');
    setAnalysisResult('');
    setError(null);
    setIsLoading(false);
  };

  const handleSubmit = useCallback(async () => {
    // Basic validation: at least one dimension selected or description filled
    const atLeastOneDimensionSelected = [
        selectedCommStyle, selectedTeamRole, selectedPressureReaction,
        selectedConflictApproach, selectedTaskMgmtStyle, selectedAdaptability, selectedLearningAttitude
    ].some(s => s !== '');

    if (!atLeastOneDimensionSelected && !colleagueDescription.trim()) {
      setError(t('colleaguePersonaAnalyzer.requiredFields'));
      setAnalysisResult('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    let promptSegments: string[] = [locale === 'en-US' ?
      "Please analyze the colleague's personality traits and behavioral patterns based on the following information:\n" :
      "请基于以下信息分析同事的人设特点、行为模式，并给出沟通建议：\n"
    ];

    const findOption = (id: string, options: PersonaDimensionOption[]) => options.find(opt => opt.id === id);

    const commStyle = findOption(selectedCommStyle, communicationStyles);
    if (commStyle) promptSegments.push(`- ${locale === 'en-US' ? 'Core Communication Style' : '核心沟通风格'}：${commStyle.emoji} ${commStyle.label} (${commStyle.description})`);

    const teamRole = findOption(selectedTeamRole, teamRoles);
    if (teamRole) promptSegments.push(`- ${locale === 'en-US' ? 'Role in Team Collaboration' : '团队协作中的角色'}：${teamRole.emoji} ${teamRole.label} (${teamRole.description})`);

    const pressureReaction = findOption(selectedPressureReaction, pressureReactions);
    if (pressureReaction) promptSegments.push(`- ${locale === 'en-US' ? 'Typical Reaction Under Pressure' : '面对压力时的典型反应'}：${pressureReaction.emoji} ${pressureReaction.label} (${pressureReaction.description})`);

    const conflictApproach = findOption(selectedConflictApproach, conflictApproaches);
    if (conflictApproach) promptSegments.push(`- ${locale === 'en-US' ? 'Conflict Handling Approach' : '处理冲突的方式'}：${conflictApproach.emoji} ${conflictApproach.label} (${conflictApproach.description})`);

    const taskMgmtStyle = findOption(selectedTaskMgmtStyle, taskManagementStyles);
    if (taskMgmtStyle) promptSegments.push(`- ${locale === 'en-US' ? 'Task Management Style' : '任务管理风格'}：${taskMgmtStyle.emoji} ${taskMgmtStyle.label} (${taskMgmtStyle.description})`);

    const adaptability = findOption(selectedAdaptability, adaptabilityToChanges);
    if (adaptability) promptSegments.push(`- ${locale === 'en-US' ? 'Adaptability to Change' : '对变化的适应程度'}：${adaptability.emoji} ${adaptability.label} (${adaptability.description})`);

    const learningAttitude = findOption(selectedLearningAttitude, learningAttitudes);
    if (learningAttitude) promptSegments.push(`- ${locale === 'en-US' ? 'Learning and Growth Attitude' : '学习与成长意愿'}：${learningAttitude.emoji} ${learningAttitude.label} (${learningAttitude.description})`);

    promptSegments.push(locale === 'en-US' ? "\nAdditional descriptions and specific examples:" : "\n补充描述和具体事例：");
    promptSegments.push(colleagueDescription.trim() || (locale === 'en-US' ? "No additional description." : "无补充描述。"));

    const finalPrompt = promptSegments.join("\n");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: finalPrompt }],
          toolId: 'colleague-persona-analyzer',
          language: locale === 'en-US' ? 'en' : 'zh'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('colleaguePersonaAnalyzer.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAnalysisResult(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for colleague persona analyzer:', data);
        throw new Error(t('colleaguePersonaAnalyzer.formatError'));
      }
    } catch (e) {
      console.error('Failed to analyze colleague persona:', e);
      const errorMessage = e instanceof Error ? e.message : t('colleaguePersonaAnalyzer.unknownError');
      setError(errorMessage);
      setAnalysisResult('');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedCommStyle, selectedTeamRole, selectedPressureReaction,
    selectedConflictApproach, selectedTaskMgmtStyle, selectedAdaptability,
    selectedLearningAttitude, colleagueDescription, communicationStyles, teamRoles,
    pressureReactions, conflictApproaches, taskManagementStyles, adaptabilityToChanges,
    learningAttitudes, t, locale
  ]);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Helper component for rendering dimension cards
  const DimensionCard: React.FC<{
    title: string;
    description: string;
    options: PersonaDimensionOption[];
    selectedValue: string;
    onSelectValue: (value: string) => void;
    dimensionNumber: number;
  }> = ({ title, description, options, selectedValue, onSelectValue, dimensionNumber }) => (
    <Card className={cn("border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors", "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
            {dimensionNumber}
          </span>
          {title}
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {options.map((option) => (
            <Button
              key={option.id}
              variant={selectedValue === option.id ? "default" : "outline"}
              className={cn(
                "h-auto p-3 text-left justify-start whitespace-normal", // Ensure text wraps
                selectedValue === option.id ?
                  "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 ring-2 ring-purple-400 dark:ring-purple-300" :
                  "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
              )}
              onClick={() => onSelectValue(option.id)}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{option.emoji}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-7">{option.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <CardHeader className="text-center p-0 mb-6">
        <div className="flex items-center justify-center mb-2">
          <Activity className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-3" />
          <CardTitle className="text-3xl font-bold">{t('colleaguePersonaAnalyzer.title')}</CardTitle>
        </div>
        <CardDescription className="text-lg text-neutral-600 dark:text-neutral-300">
          {t('colleaguePersonaAnalyzer.description')}
        </CardDescription>
      </CardHeader>

      {/* Dimension Cards */}
      <DimensionCard
        dimensionNumber={1}
        title={t('colleaguePersonaAnalyzer.communicationStyles.title')}
        description={t('colleaguePersonaAnalyzer.communicationStyles.description')}
        options={communicationStyles}
        selectedValue={selectedCommStyle}
        onSelectValue={setSelectedCommStyle}
      />
      <DimensionCard
        dimensionNumber={2}
        title={t('colleaguePersonaAnalyzer.teamRoles.title')}
        description={t('colleaguePersonaAnalyzer.teamRoles.description')}
        options={teamRoles}
        selectedValue={selectedTeamRole}
        onSelectValue={setSelectedTeamRole}
      />
      <DimensionCard
        dimensionNumber={3}
        title={t('colleaguePersonaAnalyzer.pressureReactions.title')}
        description={t('colleaguePersonaAnalyzer.pressureReactions.description')}
        options={pressureReactions}
        selectedValue={selectedPressureReaction}
        onSelectValue={setSelectedPressureReaction}
      />
      <DimensionCard
        dimensionNumber={4}
        title={t('colleaguePersonaAnalyzer.conflictApproaches.title')}
        description={t('colleaguePersonaAnalyzer.conflictApproaches.description')}
        options={conflictApproaches}
        selectedValue={selectedConflictApproach}
        onSelectValue={setSelectedConflictApproach}
      />
      <DimensionCard
        dimensionNumber={5}
        title={t('colleaguePersonaAnalyzer.taskManagementStyles.title')}
        description={t('colleaguePersonaAnalyzer.taskManagementStyles.description')}
        options={taskManagementStyles}
        selectedValue={selectedTaskMgmtStyle}
        onSelectValue={setSelectedTaskMgmtStyle}
      />
      <DimensionCard
        dimensionNumber={6}
        title={t('colleaguePersonaAnalyzer.adaptabilityToChanges.title')}
        description={t('colleaguePersonaAnalyzer.adaptabilityToChanges.description')}
        options={adaptabilityToChanges}
        selectedValue={selectedAdaptability}
        onSelectValue={setSelectedAdaptability}
      />
      <DimensionCard
        dimensionNumber={7}
        title={t('colleaguePersonaAnalyzer.learningAttitudes.title')}
        description={t('colleaguePersonaAnalyzer.learningAttitudes.description')}
        options={learningAttitudes}
        selectedValue={selectedLearningAttitude}
        onSelectValue={setSelectedLearningAttitude}
      />

      {/* Detailed Description Section */}
      <Card className={cn("border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors", "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
              8
            </span>
            {t('colleaguePersonaAnalyzer.supplementDescription.title')}
            </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            {t('colleaguePersonaAnalyzer.supplementDescription.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={colleagueDescription}
            onChange={(e) => setColleagueDescription(e.target.value)}
            placeholder={t('colleaguePersonaAnalyzer.supplementDescription.placeholder')}
            className="min-h-[150px] w-full bg-white dark:bg-neutral-700/60 border-neutral-300 dark:border-neutral-600 focus:ring-purple-500 focus:border-purple-500"
            rows={6}
          />
          <div className="space-y-3 pt-2">
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <HelpCircle className="w-4 h-4 mr-2 text-purple-500" />
                <span>{t('colleaguePersonaAnalyzer.supplementDescription.guidingPromptsTitle')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guidingPrompts.map((prompt, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleGuidingPromptClick(prompt)}
                        className="text-left justify-start h-auto whitespace-normal py-2 bg-purple-50/50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/30 border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
                    >
                        <MessageSquarePlus className="w-4 h-4 mr-2 flex-shrink-0" />
                        {prompt}
                    </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons & Result Display */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto flex-grow bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
            {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('colleaguePersonaAnalyzer.analyzing')}
                </>
            ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> {t('colleaguePersonaAnalyzer.analyzeButton')}
                </>
            )}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isLoading} className="w-full sm:w-auto border-neutral-400 dark:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <RotateCcw className="mr-2 h-4 w-4" /> {t('colleaguePersonaAnalyzer.resetButton')}
            </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-3 text-center text-purple-700 dark:text-purple-300">{t('colleaguePersonaAnalyzer.resultTitle')}</h3>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-rose-900/20 border border-purple-200 dark:border-purple-700/50 shadow-lg prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
            </div>
          </div>
        )}
        {isLoading && !analysisResult && !error && (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">{t('colleaguePersonaAnalyzer.loadingMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColleaguePersonaAnalyzer;
