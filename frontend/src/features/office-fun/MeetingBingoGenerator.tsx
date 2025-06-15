'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Gamepad2, Loader2, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
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

  const generateBingoGrid = async () => {
    setIsLoading(true);
    setError('');
    setHasWon(false);
    setMarkedCount(0);

    try {
      let wordsToUse = defaultBingoWords;
      if (customWords.trim()) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
            const aiWords = data.assistantMessage
              .split(/[,，\n]/)
              .map((word: string) => word.trim())
              .filter((word: string) => word.length > 0 && word.length <= 10)
              .slice(0, 25);
            if (aiWords.length >= 20) wordsToUse = aiWords;
          }
        }
      }
      const shuffled = [...wordsToUse].sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(0, 24);
      const grid: BingoCell[] = [];
      let wordIndex = 0;
      for (let i = 0; i < 25; i++) {
        if (i === 12) {
          grid.push({ id: i, text: 'FREE', isMarked: true, isFree: true });
        } else {
          grid.push({ id: i, text: selectedWords[wordIndex] || `词${wordIndex + 1}`, isMarked: false, isFree: false });
          wordIndex++;
        }
      }
      setBingoGrid(grid);
      setShowResult(true);
      setMarkedCount(1);
    } catch (err) {
      console.error('Error generating bingo grid:', err);
      setError('生成BINGO卡片失败，请检查自定义词汇或稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCell = (cellId: number) => {
    if (hasWon) return;
    setBingoGrid(prev => {
      const newGrid = prev.map(cell =>
        cell.id === cellId && !cell.isFree ? { ...cell, isMarked: !cell.isMarked } : cell
      );
      const marked = newGrid.filter(cell => cell.isMarked).length;
      setMarkedCount(marked);
      return newGrid;
    });
  };

  const checkWinCondition = () => {
    if (bingoGrid.length !== 25) return false;
    const lines = [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];
    for (const line of lines) {
      if (line.every(index => bingoGrid[index].isMarked)) return true;
    }
    return false;
  };

  useEffect(() => {
    if (bingoGrid.length === 25) {
      if (checkWinCondition()) {
        setHasWon(true);
      }
    }
  }, [bingoGrid]);

  const handleReset = () => {
    setShowResult(false);
    setCustomWords('');
    setBingoGrid([]);
    setError('');
    setHasWon(false);
    setMarkedCount(0);
  };

  return (
    <div className={cn("max-w-4xl mx-auto p-4 sm:p-6 space-y-6", "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100")}>
      {!showResult ? (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 dark:from-green-400 dark:to-cyan-400 bg-clip-text text-transparent">
                会议BINGO生成器
              </h1>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              输入会议主题或常用词汇（可选），AI将为您量身定制一张会议BINGO卡，让无聊的会议充满乐趣！
            </p>
          </div>

          <Separator className="bg-neutral-200 dark:bg-neutral-800" />

          <Card className={cn("border-2 hover:border-green-300 dark:hover:border-green-600 transition-colors", "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800")}>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                <span className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm", "bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300")}>
                  1
                </span>
                自定义会议主题或词汇（可选）
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                输入一些词语，AI会围绕这些词生成BINGO卡。留空则使用内置的"互联网黑话"词库。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="customWords" className="sr-only">自定义会议主题或关键词</Label>
              <Textarea
                id="customWords"
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                placeholder="例如：产品规划、技术评审、季度总结、团队建设、赋能、抓手、颗粒度..."
                rows={4}
                className={cn(
                  "w-full",
                  "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                  "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
                )}
              />
            </CardContent>
          </Card>

          {error && <p className="text-red-600 dark:text-red-400 text-center py-2">{error}</p>}

          <div className="flex justify-center pt-4">
            <Button
              onClick={generateBingoGrid}
              disabled={isLoading}
              className={cn(
                "w-full max-w-md py-3 text-lg font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-shadow",
                "bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700",
                "dark:from-green-500 dark:to-cyan-500 dark:hover:from-green-600 dark:hover:to-cyan-600",
                "disabled:from-neutral-400 disabled:to-neutral-500 dark:disabled:from-neutral-600 dark:disabled:to-neutral-700 disabled:text-neutral-300 dark:disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在生成BINGO卡...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  生成BINGO卡片
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 flex flex-col items-center">
          <div className="text-center space-y-2">
            <div className={cn("flex items-center justify-center gap-2", hasWon ? "text-yellow-500 dark:text-yellow-400" : "text-green-600 dark:text-green-400")}>
              {hasWon ? <Trophy className="w-8 h-8" /> : <Gamepad2 className="w-8 h-8" />}
              <h1 className="text-3xl font-bold">
                {hasWon ? "BINGO! 你赢了!" : "会议BINGO游戏"}
              </h1>
            </div>
            {!hasWon && <p className="text-neutral-600 dark:text-neutral-400">听到词就点一下，看看谁先连成线！</p>}
          </div>

          <div className={cn("grid grid-cols-5 gap-1 sm:gap-2 p-2 rounded-md", "bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700")}>
            {bingoGrid.map((cell) => (
              <Button
                key={cell.id}
                onClick={() => toggleCell(cell.id)}
                variant="outline"
                className={cn(
                  "aspect-square text-xs sm:text-sm md:text-base p-1 sm:p-2 w-full h-full flex items-center justify-center text-center break-all transition-all duration-200 ease-in-out font-semibold leading-tight",
                  "border-2",
                  cell.isFree ?
                    "bg-yellow-400 dark:bg-yellow-600 border-yellow-500 dark:border-yellow-700 text-white dark:text-neutral-900 cursor-default" :
                  cell.isMarked ?
                    "bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700 text-white dark:text-white transform scale-105 shadow-lg" :
                    "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600",
                  hasWon && cell.isMarked && !cell.isFree && "animate-pulse"
                )}
                disabled={cell.isFree || hasWon}
              >
                {cell.text}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Badge variant="secondary" className={cn("text-sm px-3 py-1.5", "bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300")}>
              <Target className="w-4 h-4 mr-1.5" /> 已标记: {markedCount} / 25
            </Badge>
            <Button
              onClick={handleReset}
              className={cn(
                "py-2 px-6 text-base font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-shadow",
                "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                "dark:from-orange-400 dark:to-red-400 dark:hover:from-orange-500 dark:hover:to-red-500"
              )}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {hasWon ? "再来一局" : "重置/换卡"}
            </Button>
          </div>
          {hasWon && <p className="text-xl font-bold text-yellow-500 dark:text-yellow-400 animate-bounce mt-2">恭喜你，会议划水大师！🎉</p>}
        </div>
      )}
    </div>
  );
}

export default MeetingBingoGenerator;
