'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, AlertTriangle, Activity, HelpCircle, MessageSquarePlus, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface PersonaDimensionOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const communicationStyles: PersonaDimensionOption[] = [
  { id: 'comm_direct', label: '直接坦诚', emoji: '🎯', description: '观点明确，不绕弯子' },
  { id: 'comm_diplomatic', label: '委婉含蓄', emoji: '🕊️', description: '注重方式，顾及感受' },
  { id: 'comm_logical', label: '逻辑清晰', emoji: '🧠', description: '条理分明，重数据事实' },
  { id: 'comm_expressive', label: '表达生动', emoji: '🗣️', description: '善用比喻，富有感染力' },
  { id: 'comm_reserved', label: '言简意赅', emoji: '🤐', description: '话不多，但切中要点' },
];

const teamRoles: PersonaDimensionOption[] = [
  { id: 'role_leader', label: '领导者/协调者', emoji: '👑', description: '组织引导，推动进展' },
  { id: 'role_innovator', label: '创新者/点子王', emoji: '💡', description: '常有新想法，挑战常规' },
  { id: 'role_executor', label: '执行者/实干家', emoji: '🛠️', description: '专注落实，高效完成' },
  { id: 'role_supporter', label: '支持者/协作者', emoji: '🤝', description: '乐于助人，营造氛围' },
  { id: 'role_detailer', label: '细节控/完善者', emoji: '🔍', description: '关注细节，追求完美' },
  { id: 'role_independent', label: '独立贡献者', emoji: '🚶', description: '倾向独自完成任务' },
];

const pressureReactions: PersonaDimensionOption[] = [
  { id: 'pressure_calm', label: '冷静专注', emoji: '🧘', description: '保持镇定，专注解决' },
  { id: 'pressure_proactive', label: '积极应对', emoji: '🚀', description: '迅速行动，寻找方案' },
  { id: 'pressure_anxious', label: '略显焦虑', emoji: '😟', description: '可能紧张，但仍努力' },
  { id: 'pressure_seeker', label: '寻求支持', emoji: '🙋', description: '会向他人求助或倾诉' },
  { id: 'pressure_avoidant', label: '暂时回避', emoji: '🙈', description: '短期内可能逃避问题' }, // Corrected emoji for avoidant
];

const conflictApproaches: PersonaDimensionOption[] = [
  { id: 'conflict_direct', label: '直接面对', emoji: '⚔️', description: '挑明问题，寻求解决' },
  { id: 'conflict_collaborative', label: '合作共赢', emoji: '🧑‍🤝‍🧑', description: '寻找双方满意的方案' },
  { id: 'conflict_compromising', label: '妥协折中', emoji: '⚖️', description: '愿意让步以达成一致' },
  { id: 'conflict_avoiding', label: '尽量回避', emoji: '🙈', description: '不喜欢冲突，试图避开' },
  { id: 'conflict_assertive', label: '坚持己见', emoji: '💪', description: '强力维护自己的立场' },
];

const taskManagementStyles: PersonaDimensionOption[] = [
  { id: 'task_planner', label: '计划周密', emoji: '🗓️', description: '事前规划，按部就班' },
  { id: 'task_flexible', label: '灵活应变', emoji: '🤸', description: '适应变化，随时调整' },
  { id: 'task_detail_oriented', label: '注重细节', emoji: '🔬', description: '细致入微，力求精准' },
  { id: 'task_result_driven', label: '结果导向', emoji: '🏁', description: '关注目标，效率优先' },
  { id: 'task_procrastinator', label: '间歇性拖延', emoji: '⏳', description: '偶尔拖延，但能赶上' },
];

const adaptabilityToChanges: PersonaDimensionOption[] = [
  { id: 'change_embracer', label: '积极拥抱', emoji: '🤗', description: '视变化为机遇，乐于尝试' },
  { id: 'change_cautious', label: '谨慎适应', emoji: '🧐', description: '观察了解后，逐步接受' },
  { id: 'change_resistant', label: '略有抵触', emoji: '🙅', description: '偏好稳定，不太喜欢变动' },
  { id: 'change_passive', label: '被动接受', emoji: '😶', description: '能跟上，但不会主动求变' },
];

const learningAttitudes: PersonaDimensionOption[] = [
  { id: 'learn_proactive', label: '积极主动', emoji: '🌟', description: '主动学习新技能和知识' },
  { id: 'learn_receptive', label: '乐于接受', emoji: '💡', description: '对新事物持开放态度' },
  { id: 'learn_practical', label: '实用主义', emoji: '🔧', description: '关注能解决实际问题的技能' },
  { id: 'learn_complacent', label: '满足现状', emoji: '😌', description: '对学习新东西动力不足' },
];

const guidingPrompts = [
  "这位同事在日常工作中，最让你印象深刻的三个行为或特质是什么？",
  "描述一下TA在会议或集体讨论中的典型表现。",
  "TA在面对工作压力、紧急任务或突发状况时，通常会如何应对和表现？",
  "请举一个具体事例，说明TA在团队协作或项目中扮演的角色和沟通方式。",
  "TA在接收正面反馈（表扬）和负面反馈（批评）时，分别有怎样的反应？",
  "在与他人意见不合或发生工作冲突时，TA通常会如何处理？",
  "如果用三个词来形容TA的沟通风格，你会选择哪三个词？为什么？",
  "请描述一个你认为最能体现TA人设特点的具体事例。",
];

const ColleaguePersonaAnalyzer: React.FC = () => {
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
      setError('请至少选择一个维度的特征，或填写补充描述信息！');
      setAnalysisResult('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    let promptSegments: string[] = ["请基于以下信息分析同事的人设特点、行为模式，并给出沟通建议：\n"];

    const findOption = (id: string, options: PersonaDimensionOption[]) => options.find(opt => opt.id === id);

    const commStyle = findOption(selectedCommStyle, communicationStyles);
    if (commStyle) promptSegments.push(`- 核心沟通风格：${commStyle.emoji} ${commStyle.label} (${commStyle.description})`);

    const teamRole = findOption(selectedTeamRole, teamRoles);
    if (teamRole) promptSegments.push(`- 团队协作中的角色：${teamRole.emoji} ${teamRole.label} (${teamRole.description})`);

    const pressureReaction = findOption(selectedPressureReaction, pressureReactions);
    if (pressureReaction) promptSegments.push(`- 面对压力时的典型反应：${pressureReaction.emoji} ${pressureReaction.label} (${pressureReaction.description})`);

    const conflictApproach = findOption(selectedConflictApproach, conflictApproaches);
    if (conflictApproach) promptSegments.push(`- 处理冲突的方式：${conflictApproach.emoji} ${conflictApproach.label} (${conflictApproach.description})`);

    const taskMgmtStyle = findOption(selectedTaskMgmtStyle, taskManagementStyles);
    if (taskMgmtStyle) promptSegments.push(`- 任务管理风格：${taskMgmtStyle.emoji} ${taskMgmtStyle.label} (${taskMgmtStyle.description})`);

    const adaptability = findOption(selectedAdaptability, adaptabilityToChanges);
    if (adaptability) promptSegments.push(`- 对变化的适应程度：${adaptability.emoji} ${adaptability.label} (${adaptability.description})`);

    const learningAttitude = findOption(selectedLearningAttitude, learningAttitudes);
    if (learningAttitude) promptSegments.push(`- 学习与成长意愿：${learningAttitude.emoji} ${learningAttitude.label} (${learningAttitude.description})`);

    promptSegments.push("\n补充描述和具体事例：");
    promptSegments.push(colleagueDescription.trim() || "无补充描述。");

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '同事人设分析器今天有点"迷糊"，暂时无法服务。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAnalysisResult(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for colleague persona analyzer:', data);
        throw new Error('AI返回的分析结果有点"玄乎"...');
      }
    } catch (e) {
      console.error('Failed to analyze colleague persona:', e);
      const errorMessage = e instanceof Error ? e.message : '分析同事人设时发生未知错误，可能是AI的"读心术"短路了！';
      setError(errorMessage);
      setAnalysisResult('');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedCommStyle, selectedTeamRole, selectedPressureReaction,
    selectedConflictApproach, selectedTaskMgmtStyle, selectedAdaptability,
    selectedLearningAttitude, colleagueDescription
  ]);

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
          <CardTitle className="text-3xl font-bold">同事人设分析器</CardTitle>
        </div>
        <CardDescription className="text-lg text-neutral-600 dark:text-neutral-300">
          通过选择下方各维度的描述，并补充具体事例，AI帮你精准分析同事的人设特点和行为模式。
        </CardDescription>
      </CardHeader>

      {/* Dimension Cards */}
      <DimensionCard
        dimensionNumber={1}
        title="TA的核心沟通风格是？"
        description="选择最能代表其日常沟通方式的选项。"
        options={communicationStyles}
        selectedValue={selectedCommStyle}
        onSelectValue={setSelectedCommStyle}
      />
      <DimensionCard
        dimensionNumber={2}
        title="在团队协作中，TA通常扮演什么角色？"
        description="思考TA在团队项目中的典型贡献方式。"
        options={teamRoles}
        selectedValue={selectedTeamRole}
        onSelectValue={setSelectedTeamRole}
      />
      <DimensionCard
        dimensionNumber={3}
        title="面对压力或挑战时，TA的典型反应是？"
        description="回忆TA在困境或高压下的表现。"
        options={pressureReactions}
        selectedValue={selectedPressureReaction}
        onSelectValue={setSelectedPressureReaction}
      />
      <DimensionCard
        dimensionNumber={4}
        title="TA处理工作冲突或不同意见的方式倾向于？"
        description="想想TA在争议情境下的常见做法。"
        options={conflictApproaches}
        selectedValue={selectedConflictApproach}
        onSelectValue={setSelectedConflictApproach}
      />
      <DimensionCard
        dimensionNumber={5}
        title="在任务管理和执行方面，TA的风格是？"
        description="考虑TA如何安排和完成工作任务。"
        options={taskManagementStyles}
        selectedValue={selectedTaskMgmtStyle}
        onSelectValue={setSelectedTaskMgmtStyle}
      />
      <DimensionCard
        dimensionNumber={6}
        title="面对工作中的变化（如流程调整、技术更新），TA的适应程度如何？"
        description="评估TA对新情况、新环境的接受和调整能力。"
        options={adaptabilityToChanges}
        selectedValue={selectedAdaptability}
        onSelectValue={setSelectedAdaptability}
      />
      <DimensionCard
        dimensionNumber={7}
        title="对于学习新知识和技能、寻求个人成长，TA的态度是？"
        description="观察TA在职业发展和能力提升上的表现。"
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
            补充具体描述和事例 (选填)
            </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            请在此处详细描述能体现该同事特点的具体事例、言行、或您观察到的其他重要信息。越具体，分析可能越准确。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={colleagueDescription}
            onChange={(e) => setColleagueDescription(e.target.value)}
            placeholder="例如：有一次项目紧急，小李主动承担了最难的部分，连续加班并且还帮助了其他同事... 他在会议上总是能提出一些被大家忽略的关键点..."
            className="min-h-[150px] w-full bg-white dark:bg-neutral-700/60 border-neutral-300 dark:border-neutral-600 focus:ring-purple-500 focus:border-purple-500"
            rows={6}
          />
          <div className="space-y-3 pt-2">
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <HelpCircle className="w-4 h-4 mr-2 text-purple-500" />
                <span>或点击下方问题，快速补充到描述框中（内容会追加到现有文字后）：</span>
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI深度分析中...
                </>
            ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> 开始分析人设
                </>
            )}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isLoading} className="w-full sm:w-auto border-neutral-400 dark:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <RotateCcw className="mr-2 h-4 w-4" /> 重置所有选项
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
            <h3 className="text-2xl font-semibold mb-3 text-center text-purple-700 dark:text-purple-300">AI分析报告：</h3>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-rose-900/20 border border-purple-200 dark:border-purple-700/50 shadow-lg prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
            </div>
          </div>
        )}
        {isLoading && !analysisResult && !error && (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">AI大师正在为您解构同事性格，请稍候...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColleaguePersonaAnalyzer;
