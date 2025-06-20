'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { ValidLocale } from '@/types/global';
import { Loader2, Sparkles, Target, User } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const careerLevels = [
  { value: 'junior', label: '初级员工', emoji: '🌱', description: '1-3年经验，积极学习成长' },
  { value: 'mid', label: '中级员工', emoji: '🚀', description: '3-5年经验，独当一面' },
  { value: 'senior', label: '高级员工', emoji: '⭐', description: '5-8年经验，技术专家' },
  { value: 'lead', label: '团队负责人', emoji: '👑', description: '8+年经验，带团队管理' },
  { value: 'manager', label: '部门经理', emoji: '🎯', description: '管理岗位，战略规划' },
  { value: 'director', label: '总监级别', emoji: '💎', description: '高级管理，决策层' },
];

const industries = [
  { value: 'tech', label: '互联网科技', emoji: '💻' },
  { value: 'finance', label: '金融行业', emoji: '💰' },
  { value: 'consulting', label: '咨询服务', emoji: '🎯' },
  { value: 'education', label: '教育培训', emoji: '📚' },
  { value: 'healthcare', label: '医疗健康', emoji: '🏥' },
  { value: 'retail', label: '零售电商', emoji: '🛒' },
  { value: 'manufacturing', label: '制造业', emoji: '🏭' },
  { value: 'media', label: '媒体传播', emoji: '📺' },
];

const personaStyles = [
  { value: 'professional', label: '专业严谨型', emoji: '🎩', description: '正式专业，权威可信' },
  { value: 'innovative', label: '创新前瞻型', emoji: '🚀', description: '思维活跃，引领潮流' },
  { value: 'collaborative', label: '协作亲和型', emoji: '🤝', description: '团队合作，人际和谐' },
  { value: 'results-driven', label: '结果导向型', emoji: '🎯', description: '目标明确，执行力强' },
  { value: 'analytical', label: '理性分析型', emoji: '📊', description: '数据驱动，逻辑清晰' },
  { value: 'creative', label: '创意灵感型', emoji: '🎨', description: '富有创意，思维跳跃' },
];

interface Props {
  locale: ValidLocale;
}

function ProfessionalPersonaGenerator({ locale }: Props): React.JSX.Element {
  const { t, loading } = useTranslations(locale);
  const [careerLevel, setCareerLevel] = useState<string>('mid');
  const [industry, setIndustry] = useState<string>('tech');
  const [personaStyle, setPersonaStyle] = useState<string>('professional');
  const [currentRole, setCurrentRole] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [keySkills, setKeySkills] = useState<string>('');
  const [achievements, setAchievements] = useState<string>('');
  const [personalTraits, setPersonalTraits] = useState<string>('');
  const [generatedPersona, setGeneratedPersona] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentRole.trim()) {
      setError(t('professionalPersonaGenerator.currentRoleRequired'));
      setGeneratedPersona('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPersona('');

    const selectedLevel = careerLevels.find(l => l.value === careerLevel);
    const selectedIndustry = industries.find(i => i.value === industry);
    const selectedStyle = personaStyles.find(s => s.value === personaStyle);

    const userPrompt = `
职业层级：${selectedLevel?.label} - ${selectedLevel?.description}
所属行业：${selectedIndustry?.label}
人设风格：${selectedStyle?.label} - ${selectedStyle?.description}
当前职位：${currentRole}
${targetRole.trim() ? `目标职位：${targetRole}` : ''}
${keySkills.trim() ? `核心技能：${keySkills}` : ''}
${achievements.trim() ? `主要成就：${achievements}` : ''}
${personalTraits.trim() ? `个人特质：${personalTraits}` : ''}

请为我生成一个完整的职场人设描述，包括个人简介、核心优势、工作风格、沟通特点等。
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'professional-persona-generator',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('professionalPersonaGenerator.errorFormat') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedPersona(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('professionalPersonaGenerator.errorFormat'));
      }
    } catch (e) {
      console.error('Failed to generate persona:', e);
      setError(e instanceof Error ? e.message : t('professionalPersonaGenerator.unknownError'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <User className="w-8 h-8 text-blue-500 dark:text-blue-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('professionalPersonaGenerator.title')}</h1>
        <Target className="w-8 h-8 text-blue-500 dark:text-blue-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="careerLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('professionalPersonaGenerator.careerLevelLabel')}
            </Label>
            <Select value={careerLevel} onValueChange={setCareerLevel}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}>
                <SelectValue placeholder={t('professionalPersonaGenerator.careerLevelPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                                  {careerLevels.map(level => (
                    <SelectItem
                      key={level.value}
                      value={level.value}
                      className={cn(
                        "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-blue-100 dark:focus:bg-blue-700/50",
                        "data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-600/50"
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{level.emoji} {t(`professionalPersonaGenerator.careerLevels.${level.value}`)}</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`professionalPersonaGenerator.careerLevelDescriptions.${level.value}`)}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="industry" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('professionalPersonaGenerator.industryLabel')}
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}>
                <SelectValue placeholder={t('professionalPersonaGenerator.industryPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {industries.map(ind => (
                  <SelectItem
                    key={ind.value}
                    value={ind.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-blue-100 dark:focus:bg-blue-700/50",
                      "data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-600/50"
                    )}
                  >
                    <span>{ind.emoji} {t(`professionalPersonaGenerator.industries.${ind.value}`)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="personaStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('professionalPersonaGenerator.personaStyleLabel')}
            </Label>
            <Select value={personaStyle} onValueChange={setPersonaStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}>
                <SelectValue placeholder={t('professionalPersonaGenerator.personaStylePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {personaStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-blue-100 dark:focus:bg-blue-700/50",
                      "data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {t(`professionalPersonaGenerator.personaStyles.${style.value}`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`professionalPersonaGenerator.personaStyleDescriptions.${style.value}`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentRole" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('professionalPersonaGenerator.currentRoleLabel')}
            </Label>
            <Input
              id="currentRole"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder={t('professionalPersonaGenerator.currentRolePlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="targetRole" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('professionalPersonaGenerator.targetRoleLabel')}
            </Label>
            <Input
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={t('professionalPersonaGenerator.targetRolePlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="keySkills" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('professionalPersonaGenerator.keySkillsLabel')}
          </Label>
          <Textarea
            id="keySkills"
            value={keySkills}
            onChange={(e) => setKeySkills(e.target.value)}
            placeholder={t('professionalPersonaGenerator.keySkillsPlaceholder')}
            className={cn(
              "w-full min-h-[60px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            )}
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="achievements" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('professionalPersonaGenerator.achievementsLabel')}
          </Label>
          <Textarea
            id="achievements"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder={t('professionalPersonaGenerator.achievementsPlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            )}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="personalTraits" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('professionalPersonaGenerator.personalTraitsLabel')}
          </Label>
          <Input
            id="personalTraits"
            value={personalTraits}
            onChange={(e) => setPersonalTraits(e.target.value)}
            placeholder={t('professionalPersonaGenerator.personalTraitsPlaceholder')}
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('professionalPersonaGenerator.generating')}</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('professionalPersonaGenerator.generateButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('professionalPersonaGenerator.error')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedPersona && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('professionalPersonaGenerator.generating')}...🎭</p>
        </div>
      )}

      {generatedPersona && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center">
              <User className="w-5 h-5 mr-2" /> {t('professionalPersonaGenerator.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedPersona}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfessionalPersonaGenerator;
