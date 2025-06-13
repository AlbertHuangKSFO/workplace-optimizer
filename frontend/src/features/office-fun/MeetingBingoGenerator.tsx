import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Textarea } from '@/components/ui/Textarea';
import { Gamepad2, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BingoCell {
  id: number;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

const defaultBingoWords = [
  // 原有词汇
  "赋能", "闭环", "抓手", "对齐", "颗粒度", "打法", "沉淀", "复盘",
  "拉齐", "同步", "落地", "推进", "深度", "维度", "链路", "漏斗",
  "转化", "留存", "增长", "破圈", "出圈", "私域", "公域", "触达",

  // 策略规划类
  "拆解", "抽象", "聚焦", "收敛", "发散", "切入", "突破", "渗透",
  "布局", "卡位", "占位", "定位", "切换", "迁移", "升级", "优化",
  "整合", "协同", "联动", "串联", "并联", "嵌入", "植入", "切入",

  // 执行动作类
  "拆分", "梳理", "盘点", "扫描", "摸排", "调研", "走查", "巡检",
  "输出", "交付", "落实", "执行", "跟进", "推动", "牵头", "主导",
  "配合", "支撑", "保障", "兜底", "托底", "补位", "填坑", "救火",

  // 数据指标类
  "指标", "KPI", "OKR", "ROI", "GMV", "DAU", "MAU", "PV", "UV",
  "转化率", "留存率", "活跃度", "渗透率", "覆盖率", "达成率", "完成率",
  "基线", "基准", "阈值", "峰值", "均值", "中位数", "分位数", "趋势",

  // 流程管理类
  "流程", "环节", "节点", "卡点", "痛点", "堵点", "断点", "盲点",
  "全链路", "端到端", "一站式", "全流程", "闭环管理", "精细化",
  "标准化", "规范化", "流程化", "体系化", "平台化", "中台化",

  // 技术概念类
  "架构", "框架", "模块", "组件", "插件", "中间件", "底层", "上层",
  "前端", "后端", "全栈", "微服务", "容器化", "云原生", "数字化",
  "智能化", "自动化", "可视化", "透明化", "一体化", "集成化",

  // 商业模式类
  "生态", "平台", "场景", "模式", "玩法", "套路", "路径", "通道",
  "入口", "出口", "接口", "界面", "交互", "体验", "感知", "认知",
  "心智", "品牌", "口碑", "声量", "热度", "话题", "IP", "标签",

  // 团队协作类
  "协作", "配合", "联动", "互动", "沟通", "汇报", "汇总", "统计",
  "分析", "洞察", "判断", "决策", "拍板", "定调", "背书", "站台",
  "露出", "曝光", "传播", "扩散", "扩容", "缩容", "扩展", "收缩",

  // 创新发展类
  "创新", "突破", "颠覆", "重构", "重塑", "革新", "变革", "转型",
  "升级", "迭代", "演进", "进化", "蜕变", "跃升", "飞跃", "质变",
  "量变", "积累", "沉淀", "厚积", "薄发", "爆发", "井喷", "风口",

  // 竞争分析类
  "竞品", "对标", "基准", "标杆", "差距", "优势", "劣势", "机会",
  "威胁", "壁垒", "护城河", "门槛", "天花板", "红海", "蓝海", "增量",
  "存量", "市场", "份额", "占比", "渗透", "下沉", "上浮", "横向",

  // 用户运营类
  "用户", "客户", "C端", "B端", "G端", "画像", "标签", "分层",
  "分群", "细分", "精准", "个性化", "定制化", "千人千面", "AB测试",
  "灰度", "内测", "公测", "上线", "下线", "迭代", "版本", "发布"
];


function MeetingBingoGenerator(): React.JSX.Element {
  const [customWords, setCustomWords] = useState<string>('');
  const [bingoGrid, setBingoGrid] = useState<BingoCell[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [markedCount, setMarkedCount] = useState<number>(0);

  // 生成5x5的宾果网格
  const generateBingoGrid = async () => {
    setIsLoading(true);
    setError('');
    setHasWon(false);
    setMarkedCount(0);

    try {
      let wordsToUse = defaultBingoWords;

      // 如果用户输入了自定义词汇，尝试从AI获取更多相关词汇
      if (customWords.trim()) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `请基于这些主题生成25个适合会议BINGO的词汇或短语：${customWords.trim()}。请只返回词汇列表，用逗号分隔，不要其他解释。`
            }],
            toolId: 'meeting-bingo-generator',
            language: 'zh'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.assistantMessage) {
            // 解析AI返回的词汇
            const aiWords = data.assistantMessage
              .split(/[,，\n]/)
              .map((word: string) => word.trim())
              .filter((word: string) => word.length > 0 && word.length <= 8)
              .slice(0, 25);

            if (aiWords.length >= 20) {
              wordsToUse = aiWords;
            }
          }
        }
      }

      // 随机选择24个词汇（第13个位置是FREE）
      const shuffled = [...wordsToUse].sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(0, 24);

      // 创建5x5网格
      const grid: BingoCell[] = [];
      let wordIndex = 0;

      for (let i = 0; i < 25; i++) {
        if (i === 12) { // 中心位置是FREE
          grid.push({
            id: i,
            text: 'FREE',
            isMarked: true,
            isFree: true
          });
        } else {
          grid.push({
            id: i,
            text: selectedWords[wordIndex] || `词汇${wordIndex + 1}`,
            isMarked: false,
            isFree: false
          });
          wordIndex++;
        }
      }

      setBingoGrid(grid);
      setShowResult(true);
      setMarkedCount(1); // FREE格子已标记
    } catch (error) {
      console.error('Error generating bingo grid:', error);
      setError('生成BINGO卡片失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换格子标记状态
  const toggleCell = (cellId: number) => {
    if (hasWon) return;

    setBingoGrid(prev => {
      const newGrid = prev.map(cell =>
        cell.id === cellId && !cell.isFree
          ? { ...cell, isMarked: !cell.isMarked }
          : cell
      );

      // 计算标记数量
      const marked = newGrid.filter(cell => cell.isMarked).length;
      setMarkedCount(marked);

      return newGrid;
    });
  };

  // 检查是否获胜
  const checkWin = () => {
    if (bingoGrid.length !== 25) return false;

    // 检查行
    for (let row = 0; row < 5; row++) {
      let rowComplete = true;
      for (let col = 0; col < 5; col++) {
        if (!bingoGrid[row * 5 + col].isMarked) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) return true;
    }

    // 检查列
    for (let col = 0; col < 5; col++) {
      let colComplete = true;
      for (let row = 0; row < 5; row++) {
        if (!bingoGrid[row * 5 + col].isMarked) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) return true;
    }

    // 检查对角线
    let diag1Complete = true;
    let diag2Complete = true;
    for (let i = 0; i < 5; i++) {
      if (!bingoGrid[i * 5 + i].isMarked) diag1Complete = false;
      if (!bingoGrid[i * 5 + (4 - i)].isMarked) diag2Complete = false;
    }

    return diag1Complete || diag2Complete;
  };

  // 监听网格变化，检查获胜状态
  useEffect(() => {
    if (bingoGrid.length > 0) {
      const won = checkWin();
      setHasWon(won);
    }
  }, [bingoGrid]);

  const handleReset = () => {
    setBingoGrid([]);
    setCustomWords('');
    setError('');
    setHasWon(false);
    setShowResult(false);
    setMarkedCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!showResult ? (
        <div className="space-y-6">
          {/* 标题部分 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                会议BINGO游戏
              </h1>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              将无聊的会议变成刺激的BINGO游戏！听到这些词就划掉，看谁先连成一线！🎯
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                5x5网格
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                连线获胜
              </Badge>
            </div>
          </div>

          <Separator />

          {/* 自定义词汇输入 */}
          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                  1
                </span>
                自定义会议主题（可选）
              </CardTitle>
              <CardDescription>
                输入您的会议主题或常见词汇，AI将生成相关的BINGO词汇。留空则使用默认词汇。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="words">会议主题或关键词</Label>
                <Textarea
                  id="words"
                  placeholder="例如：产品规划、技术评审、季度总结、团队建设..."
                  value={customWords}
                  onChange={(e) => setCustomWords(e.target.value)}
                  className="min-h-[80px]"
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
              onClick={generateBingoGrid}
              disabled={isLoading}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  正在生成BINGO卡片...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  生成BINGO卡片
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 游戏状态 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                会议BINGO游戏
              </h1>
              {hasWon && <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Badge variant={hasWon ? "default" : "outline"} className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                已标记: {markedCount}/25
              </Badge>
              {hasWon && (
                <Badge className="bg-yellow-500 text-yellow-900 flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  BINGO! 🎉
                </Badge>
              )}
            </div>

            {hasWon && (
              <div className="bg-gradient-to-r from-yellow-100 to-green-100 border border-yellow-300 rounded-lg p-4">
                <p className="text-lg font-bold text-yellow-800">
                  🎉 恭喜！您获得了BINGO！🎉
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  您成功连成一线，成为会议BINGO大师！
                </p>
              </div>
            )}
          </div>

                    {/* BINGO网格 */}
          <Card className="border-2 border-green-200 bg-neutral-800">
            <CardHeader>
              <CardTitle className="text-center text-white">
                点击听到的词汇来标记 ✓
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                连成一行、一列或对角线即可获胜！
              </CardDescription>
            </CardHeader>
            <CardContent>
                            <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
                {bingoGrid.map((cell) => (
                  <button
                    key={cell.id}
                    onClick={() => toggleCell(cell.id)}
                    disabled={cell.isFree || hasWon}
                    className={`
                      w-20 h-20 rounded-lg border-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center
                      ${cell.isMarked
                        ? cell.isFree
                          ? 'bg-yellow-200 border-yellow-400 text-yellow-800'
                          : 'bg-green-200 border-green-400 text-green-800 line-through'
                        : 'bg-gray-100 border-gray-400 text-gray-800 hover:border-green-400 hover:bg-green-100'
                      }
                      ${hasWon ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                      ${cell.isFree ? 'cursor-default' : ''}
                    `}
                  >
                    <div className="text-center leading-tight px-1">
                      {cell.text}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 游戏说明 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>游戏规则：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>在会议中听到网格中的词汇时，点击对应格子标记</li>
                  <li>连成一行、一列或对角线即可获胜</li>
                  <li>中心的"FREE"格子默认已标记</li>
                  <li>标记的格子会显示删除线效果</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button onClick={handleReset} variant="outline" className="px-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
            <Button onClick={generateBingoGrid} className="px-6">
              <Gamepad2 className="w-4 h-4 mr-2" />
              生成新卡片
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingBingoGenerator;
