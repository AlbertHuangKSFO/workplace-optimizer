'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from "@/components/ui/Progress"; // For XP bar
import { cn } from '@/lib/utils';
import { Award, Bone, Briefcase, Crown, RefreshCcw, Rocket, TrendingUp, User, Zap } from 'lucide-react'; // Icons for levels and actions
import React, { useCallback, useEffect, useState } from 'react';

interface Level {
  id: number;
  name: string;
  xpRequired: number; // XP needed to reach this level from the previous one
  totalXpToReach: number; // Total XP from start to reach this level
  description: string;
  icon: React.ElementType;
  salaryIndicator?: string; // Just for fun
}

const initialLevels: Level[] = [
  { id: 0, name: '啃老族', xpRequired: 0, totalXpToReach: 0, description: '简历？那是什么，能吃吗？', icon: Bone, salaryIndicator: '¥0 (倒贴)' },
  { id: 1, name: '菜鸟实习生', xpRequired: 100, totalXpToReach: 100, description: '每天的工作：复印，订外卖，背锅。', icon: User, salaryIndicator: '微薄车马费' },
  { id: 2, name: '职场小白', xpRequired: 250, totalXpToReach: 350, description: '终于能独立完成PPT了...然后被老板改了十遍。', icon: Briefcase, salaryIndicator: '月薪3k' },
  { id: 3, name: '普通职员', xpRequired: 500, totalXpToReach: 850, description: '996是福报，摸鱼是哲学。', icon: Briefcase, salaryIndicator: '月薪8k' },
  { id: 4, name: '资深员工', xpRequired: 1000, totalXpToReach: 1850, description: '"这个问题很简单，你先这样...再那样..." (内心：别问我！)', icon: Award, salaryIndicator: '月薪15k' },
  { id: 5, name: '小组主管', xpRequired: 2000, totalXpToReach: 3850, description: '开会，开会，还在开会... 我的头发呢？', icon: Award, salaryIndicator: '月薪30k' },
  { id: 6, name: '部门经理', xpRequired: 4000, totalXpToReach: 7850, description: 'PPT上的饼画了一个又一个，但自己没空吃。', icon: Rocket, salaryIndicator: '月薪50k' },
  { id: 7, name: '公司总监', xpRequired: 8000, totalXpToReach: 15850, description: '"公司的未来，就在我们手中！" (小声：预算在哪？)', icon: Rocket, salaryIndicator: '年薪百万' },
  { id: 8, name: 'CEO / 霸道总裁', xpRequired: 15000, totalXpToReach: 30850, description: '"我一分钟几十万上下，你跟我说这个？" (其实在玩贪吃蛇)', icon: Crown, salaryIndicator: '财富自由' },
  { id: 9, name: '退休/世界首富', xpRequired: 0, totalXpToReach: 30851, description: '终于可以专心钓鱼/环游世界/研究黑洞了。', icon: Crown, salaryIndicator: '花钱也是个技术活'}
];

const XP_PER_CLICK = 10;
const LOCAL_STORAGE_KEY = 'careerLevelingSystemProgress';

function CareerLevelingSystem(): React.JSX.Element {
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [currentLevelId, setCurrentLevelId] = useState<number>(0);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProgress) {
      const { levelId, xp } = JSON.parse(savedProgress);
      setCurrentLevelId(levelId);
      setCurrentXp(xp);
    } else {
      // Start at the first defined actual job level if no saved progress
      setCurrentLevelId(initialLevels.findIndex(l => l.id === 1) !== -1 ? 1 : 0);
      setCurrentXp(0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ levelId: currentLevelId, xp: currentXp }));
  }, [currentLevelId, currentXp]);

  const currentLevel = levels.find(l => l.id === currentLevelId) || levels[0];
  const nextLevel = levels.find(l => l.id === currentLevelId + 1);

  const xpForNextLevel = nextLevel ? nextLevel.xpRequired : Infinity;
  const progressPercentage = nextLevel ? (currentXp / xpForNextLevel) * 100 : 100;

  const handleWorkHard = useCallback(() => {
    if (!nextLevel) {
      setMessage('恭喜！您已达到职业巅峰，可以安心享受人生了！');
      return;
    }
    const newXp = currentXp + XP_PER_CLICK;
    setCurrentXp(newXp);
    setMessage(`经验值 +${XP_PER_CLICK}！继续搬砖，共创辉煌！`);
  }, [currentXp, nextLevel]);

  const handlePromote = useCallback(() => {
    if (nextLevel && currentXp >= xpForNextLevel) {
      setCurrentLevelId(nextLevel.id);
      setCurrentXp(currentXp - xpForNextLevel); // Carry over extra XP or reset to 0 based on preference. Here, carry over.
      setMessage(`恭喜晋升为 ${nextLevel.name}！前途无量啊！`);
    } else if (!nextLevel) {
       setMessage('您已是人中龙凤，再升就只能飞升了！');
    } else {
      setMessage('经验尚浅，仍需努力！革命尚未成功，同志仍需搬砖！');
    }
  }, [currentXp, nextLevel, xpForNextLevel]);

  const handleReset = useCallback(() => {
    setCurrentLevelId(initialLevels.findIndex(l => l.id === 1) !== -1 ? 1 : 0); // Reset to first actual job level
    setCurrentXp(0);
    setMessage('人生重开模拟器启动！是时候从头再来了！');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const CurrentIcon = currentLevel.icon;

  return (
    <Card className={cn(
      "w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <TrendingUp className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
          职场等级系统
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          从办公室菜鸟到霸道总裁，体验火箭般的晋升之路！
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-grow">
        <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-neutral-800 shadow">
          <div className="flex items-center justify-center mb-3">
            <CurrentIcon className="w-16 h-16 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">{currentLevel.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">{currentLevel.salaryIndicator}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{currentLevel.description}"</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>当前经验 (XP):</span>
            <span>{currentXp} / {nextLevel ? xpForNextLevel : 'MAX'}</span>
          </div>
          <Progress value={progressPercentage} className="w-full h-3" />
          {nextLevel && <p className="text-xs text-right text-gray-500 dark:text-gray-400">下一级: {nextLevel.name}</p>}
        </div>

        {message && (
          <p className={cn(
            "text-center text-sm p-2 rounded-md",
            message.includes('恭喜') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          )}>
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button onClick={handleWorkHard} disabled={!nextLevel} className="w-full py-3 text-base">
            <Zap className="mr-2 h-5 w-5" /> 努力搬砖
          </Button>
          <Button onClick={handlePromote} disabled={!nextLevel || currentXp < xpForNextLevel} className="w-full py-3 text-base">
            <Rocket className="mr-2 h-5 w-5" /> 我要晋升
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-6 flex-col items-center">
         <Button onClick={handleReset} variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-red-500">
            <RefreshCcw className="mr-1.5 h-3 w-3" /> 不玩了，重开！
          </Button>
      </CardFooter>
    </Card>
  );
}

export default CareerLevelingSystem;
