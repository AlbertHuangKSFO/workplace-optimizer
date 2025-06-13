'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { Briefcase, FileText, Loader2, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const resignationTypes = [
  { value: 'better-opportunity', label: '更好机会', emoji: '🚀', description: '获得更好的职业发展机会' },
  { value: 'career-change', label: '转行发展', emoji: '🔄', description: '转向不同的行业或职能' },
  { value: 'personal-reasons', label: '个人原因', emoji: '👤', description: '家庭、健康等个人因素' },
  { value: 'company-culture', label: '文化不合', emoji: '🏢', description: '与公司文化价值观不匹配' },
  { value: 'work-life-balance', label: '工作生活平衡', emoji: '⚖️', description: '追求更好的工作生活平衡' },
  { value: 'compensation', label: '薪酬待遇', emoji: '💰', description: '薪酬福利不满意' },
  { value: 'growth-limitation', label: '发展受限', emoji: '📈', description: '职业发展空间有限' },
  { value: 'relocation', label: '地理位置', emoji: '🌍', description: '搬迁或地理位置因素' },
];

const relationshipLevels = [
  { value: 'positive', label: '关系良好', emoji: '😊', description: '与公司和同事关系融洽' },
  { value: 'neutral', label: '关系一般', emoji: '😐', description: '正常的工作关系' },
  { value: 'strained', label: '关系紧张', emoji: '😬', description: '存在一些矛盾或分歧' },
  { value: 'professional', label: '纯粹职业', emoji: '🤝', description: '保持专业的工作关系' },
];

const noticeStyles = [
  { value: 'formal', label: '正式官方', emoji: '📋', description: '严格按照公司流程的正式通知' },
  { value: 'grateful', label: '感谢型', emoji: '🙏', description: '强调感谢和正面经历' },
  { value: 'brief', label: '简洁型', emoji: '✂️', description: '简明扼要，不过多解释' },
  { value: 'detailed', label: '详细型', emoji: '📝', description: '详细说明原因和交接安排' },
  { value: 'diplomatic', label: '外交型', emoji: '🤝', description: '圆滑得体，避免冲突' },
  { value: 'honest', label: '坦诚型', emoji: '💯', description: '诚实表达想法和感受' },
];

function ResignationTemplates(): React.JSX.Element {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPosition.trim()) {
      setError('请输入当前职位！');
      setGeneratedTemplate('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedTemplate('');

    const selectedResignation = resignationTypes.find(r => r.value === resignationType);
    const selectedRelationship = relationshipLevels.find(r => r.value === relationshipLevel);
    const selectedStyle = noticeStyles.find(s => s.value === noticeStyle);

    const userPrompt = `
离职原因：${selectedResignation?.label} - ${selectedResignation?.description}
关系状况：${selectedRelationship?.label} - ${selectedRelationship?.description}
通知风格：${selectedStyle?.label} - ${selectedStyle?.description}

当前职位：${currentPosition}
${workDuration.trim() ? `工作时长：${workDuration}` : ''}
${specificReasons.trim() ? `具体原因：${specificReasons}` : ''}
${handoverPlans.trim() ? `交接计划：${handoverPlans}` : ''}

请生成一份专业、得体的离职申请或通知文案，包括邮件标题和正文内容。
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '文案生成失败，可能是HR顾问在思考更好的表达方式。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedTemplate(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError('AI返回的文案格式有误，HR顾问可能在重新组织语言...📝');
      }
    } catch (e) {
      console.error('Failed to generate template:', e);
      setError(e instanceof Error ? e.message : '生成文案时发生未知错误，职业规划师还需要更多时间！💼');
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <LogOut className="w-8 h-8 text-purple-500 dark:text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">离职/跳槽文案生成器</h1>
        <Briefcase className="w-8 h-8 text-purple-500 dark:text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="resignationType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              离职原因：
            </Label>
            <Select value={resignationType} onValueChange={setResignationType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}>
                <SelectValue placeholder="选择离职原因..." />
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
              关系状况：
            </Label>
            <Select value={relationshipLevel} onValueChange={setRelationshipLevel}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}>
                <SelectValue placeholder="选择关系状况..." />
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
              通知风格：
            </Label>
            <Select value={noticeStyle} onValueChange={setNoticeStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
              )}>
                <SelectValue placeholder="选择通知风格..." />
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
              当前职位：
            </Label>
            <Input
              id="currentPosition"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              placeholder="例如：高级产品经理、技术总监、市场专员..."
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
              工作时长（选填）：
            </Label>
            <Input
              id="workDuration"
              value={workDuration}
              onChange={(e) => setWorkDuration(e.target.value)}
              placeholder="例如：3年5个月、2年、10个月..."
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
            具体原因（选填）：
          </Label>
          <Textarea
            id="specificReasons"
            value={specificReasons}
            onChange={(e) => setSpecificReasons(e.target.value)}
            placeholder="可以更详细地说明离职原因，例如：追求新的职业挑战，个人发展规划等..."
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
            交接计划（选填）：
          </Label>
          <Textarea
            id="handoverPlans"
            value={handoverPlans}
            onChange={(e) => setHandoverPlans(e.target.value)}
            placeholder="例如：我将尽力配合完成工作交接，确保项目平稳过渡..."
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 生成文案中...</>
          ) : (
            <><FileText className="mr-2 h-4 w-4" /> 生成离职文案</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">生成失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedTemplate && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-purple-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">HR顾问正在精心撰写您的离职文案...📝</p>
        </div>
      )}

      {generatedTemplate && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> 您的离职文案
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedTemplate}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ResignationTemplates;
