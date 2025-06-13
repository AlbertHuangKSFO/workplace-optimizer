import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { CircleDot, Compass, Eye, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FengshuiOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const workstationLayouts: FengshuiOption[] = [
  { id: 'wall-back', label: '背靠墙壁', emoji: '🧱', description: '背后有靠山，稳如泰山' },
  { id: 'aisle-back', label: '背靠过道', emoji: '🚶‍♂️', description: '背后人来人往，容易分心' },
  { id: 'window-back', label: '背靠窗户', emoji: '🪟', description: '背后空虚，需要化解' },
  { id: 'corner', label: '角落位置', emoji: '📐', description: '聚气之地，但要防压抑' }
];

const monitorDirections: FengshuiOption[] = [
  { id: 'north', label: '朝北', emoji: '🧭', description: '水位，利于思考' },
  { id: 'south', label: '朝南', emoji: '☀️', description: '火位，精力充沛' },
  { id: 'east', label: '朝东', emoji: '🌅', description: '木位，生机勃勃' },
  { id: 'west', label: '朝西', emoji: '🌅', description: '金位，利于决策' },
  { id: 'unknown', label: '不确定', emoji: '❓', description: '需要罗盘定位' }
];

const deskItems: FengshuiOption[] = [
  { id: 'plant', label: '绿植', emoji: '🪴', description: '生气旺盛，净化磁场' },
  { id: 'coffee', label: '咖啡杯', emoji: '☕', description: '提神醒脑，但要常换水' },
  { id: 'figurine', label: '手办/公仔', emoji: '🎎', description: '招财纳福，增加人气' },
  { id: 'books', label: '技术书籍', emoji: '📚', description: '智慧之源，提升运势' },
  { id: 'snacks', label: '零食', emoji: '🍪', description: '甜蜜加持，但要适量' },
  { id: 'mirror', label: '镜子', emoji: '🪞', description: '反射煞气，但要小心' }
];

function OfficeFengshuiDetector(): React.JSX.Element {
  const [layout, setLayout] = useState<string>('');
  const [direction, setDirection] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [problems, setProblems] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleItemToggle = (itemId: string) => {
    setItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (!layout || !direction) {
      setError('请至少选择工位布局和显示器朝向！');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const layoutInfo = workstationLayouts.find(l => l.id === layout);
      const directionInfo = monitorDirections.find(d => d.id === direction);
      const selectedItems = items.map(id => deskItems.find(item => item.id === id)).filter(Boolean);

      const userInput = `
工位布局分析：
- 背靠情况：${layoutInfo?.emoji} ${layoutInfo?.label} (${layoutInfo?.description})
- 显示器朝向：${directionInfo?.emoji} ${directionInfo?.label} (${directionInfo?.description})
- 桌面物品：${selectedItems.map(item => `${item?.emoji} ${item?.label}`).join('、') || '无特殊物品'}

${problems ? `遇到的问题：${problems}` : ''}

请为我的工位进行风水分析，并给出开运建议！
      `.trim();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          toolId: 'office-fengshui-detector',
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

      setResult(data.assistantMessage || '风水分析失败');
    } catch (err: any) {
      console.error('风水检测失败:', err);
      setError(`检测失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLayout('');
    setDirection('');
    setItems([]);
    setProblems('');
    setResult('');
    setError('');
  };

  const getCompletionRate = () => {
    let completed = 0;
    if (layout) completed += 40;
    if (direction) completed += 40;
    if (items.length > 0) completed += 10;
    if (problems.trim()) completed += 10;
    return completed;
  };

  return (
    <div className={cn(
      "max-w-4xl mx-auto p-6 space-y-6",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
      )}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Compass className="w-8 h-8 text-purple-600 dark:text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 bg-clip-text text-transparent">
            办公室风水检测器
          </h1>
          <CircleDot className="w-8 h-8 text-purple-600 dark:text-purple-500" />
        </div>
        <p className="text-neutral-600 dark:text-muted-foreground max-w-2xl mx-auto">
          感觉工位磁场不对劲？让赛博玄学大师为您勘测职场"龙脉"，调理"代码气场"！☯️
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className={cn(
            "flex items-center gap-1",
            "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            )}>
            <Eye className="w-4 h-4" />
            完成度: {getCompletionRate()}%
          </Badge>
          <Badge variant="outline" className={cn(
            "flex items-center gap-1",
            "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            )}>
            <Sparkles className="w-4 h-4" />
            玄学分析
          </Badge>
        </div>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-700"/>

      {!result ? (
        <div className="space-y-6">
          {/* 工位布局 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  1
                </span>
                您的工位背靠什么？
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">背后有靠山，工作才稳当</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workstationLayouts.map((option) => (
                  <Button
                    key={option.id}
                    variant={layout === option.id ? "default" : "outline"}
                    className={cn(
                      "h-auto p-4 text-left justify-start",
                      layout === option.id ?
                        "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" :
                        "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
                    )}
                    onClick={() => setLayout(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 显示器朝向 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  2
                </span>
                显示器朝向哪个方位？
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">选对方位，思路自来</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {monitorDirections.map((option) => (
                  <Button
                    key={option.id}
                    variant={direction === option.id ? "default" : "outline"}
                    className={cn(
                      "h-auto p-4 text-left justify-start",
                      direction === option.id ?
                        "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" :
                        "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
                    )}
                    onClick={() => setDirection(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 桌面物品 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  3
                </span>
                桌面上摆放了哪些开运好物？ (可选)
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">小小物件，大大能量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {deskItems.map((option) => (
                  <Button
                    key={option.id}
                    variant={items.includes(option.id) ? "default" : "outline"}
                    className={cn(
                      "h-auto p-4 text-left justify-start",
                      items.includes(option.id) ?
                        "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" :
                        "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
                    )}
                    onClick={() => handleItemToggle(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 遇到的问题 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  4
                </span>
                最近遇到什么职场难题？ (可选)
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">具体描述，精准化解</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                placeholder="例如：最近总是感觉很疲惫，工作效率不高，和同事沟通不畅..."
                className={cn(
                  "min-h-[100px]",
                  "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600",
                  "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
                  )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!layout || !direction)}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <Zap className="w-5 h-5 mr-2 animate-ping" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              开始勘测风水！
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                "w-full sm:w-auto",
                "border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
            >
              重新填写
            </Button>
          </div>
        </div>
      ) : (
        <Card className={cn(
          "border-2 border-purple-300 dark:border-purple-600 shadow-xl",
          "bg-neutral-50 dark:bg-neutral-800/50"
          )}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500">
              风水勘测报告
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">您的专属办公室开运指南</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">错误：{error}</p>}
            <Button onClick={handleReset} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              再测一次
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OfficeFengshuiDetector;
