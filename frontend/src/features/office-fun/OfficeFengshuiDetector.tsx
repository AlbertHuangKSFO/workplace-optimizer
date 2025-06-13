import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Textarea } from '@/components/ui/Textarea';
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Compass className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            办公室风水检测器
          </h1>
          <CircleDot className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          感觉工位磁场不对劲？让赛博玄学大师为您勘测职场"龙脉"，调理"代码气场"！☯️
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            完成度: {getCompletionRate()}%
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            玄学分析
          </Badge>
        </div>
      </div>

      <Separator />

      {!result ? (
        <div className="space-y-6">
          {/* 工位布局 */}
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                  1
                </span>
                您的工位背靠什么？
              </CardTitle>
              <CardDescription>背后有靠山，工作才稳当</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workstationLayouts.map((option) => (
                  <Button
                    key={option.id}
                    variant={layout === option.id ? "default" : "outline"}
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => setLayout(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 显示器朝向 */}
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                  2
                </span>
                显示器朝向哪个方位？
              </CardTitle>
              <CardDescription>方位决定气场流向</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {monitorDirections.map((option) => (
                  <Button
                    key={option.id}
                    variant={direction === option.id ? "default" : "outline"}
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => setDirection(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 桌面物品 */}
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                  3
                </span>
                桌上摆放了哪些物品？
              </CardTitle>
              <CardDescription>可多选，每样物品都有其风水寓意</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {deskItems.map((option) => (
                  <Button
                    key={option.id}
                    variant={items.includes(option.id) ? "default" : "outline"}
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => handleItemToggle(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 遇到的问题 */}
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                  4
                </span>
                最近遇到什么"不科学"的困扰？
              </CardTitle>
              <CardDescription>比如需求总是变、代码老是bug、同事关系等（可选）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="problems">描述您的困扰</Label>
                <Textarea
                  id="problems"
                  placeholder="比如：最近需求像水逆一样天天改，代码总是莫名其妙出bug，或者感觉工位磁场不对劲..."
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

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
              disabled={isLoading || !layout || !direction}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  正在勘测风水...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  开始风水分析
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-purple-200 bg-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Compass className="w-6 h-6 text-white" />
                您的工位风水分析报告
              </CardTitle>
              <CardDescription>
                基于玄学理论的专业分析（纯属娱乐，请勿当真）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-left leading-relaxed space-y-3 text-white">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-white" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-white" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 text-white leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-white" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-white" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-white" {...props} />,
                    li: ({node, ...props}) => <li className="text-white" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 italic text-gray-300" {...props} />,
                    code: ({node, ...props}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-white" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-4 border-gray-600" {...props} />
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleReset} variant="outline" className="px-6">
              重新检测风水
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficeFengshuiDetector;
