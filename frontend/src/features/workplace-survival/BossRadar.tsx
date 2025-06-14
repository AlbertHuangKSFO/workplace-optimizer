'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    Flame,
    Loader2,
    Meh,
    ScanLine,
    Skull,
    Smile,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface RiskLevel {
  level: number;
  name: string;
  Icon: React.ElementType;
  colorClass: string; // Tailwind CSS color class (e.g., text-green-500, bg-green-100)
  messages: string[];
  bgColorClass: string; // Tailwind CSS background color class for the display area
}

const riskLevels: RiskLevel[] = [
  {
    level: 0,
    name: '绝对安全',
    Icon: Smile,
    colorClass: 'text-green-500',
    bgColorClass: 'bg-green-100 dark:bg-green-800/30',
    messages: [
      '老板放年假中，办公室堪比度假村！',
      '老板出差一周，尽情享受自由时光！',
      '风平浪静，老板可能在闭关修炼薪酬方案。',
      '安全到可以组织办公室羽毛球赛了！',
    ],
  },
  {
    level: 1,
    name: '低风险',
    Icon: Meh,
    colorClass: 'text-blue-500',
    bgColorClass: 'bg-blue-100 dark:bg-blue-800/30',
    messages: [
      '老板在开会，但偶尔会出来倒杯水。',
      '老板情绪稳定，适合汇报一些无关痛痒的工作。',
      '办公室气氛祥和，但别太大声摸鱼。',
      '可以摸鱼，但记得设置老板键。',
    ],
  },
  {
    level: 2,
    name: '中等风险',
    Icon: AlertTriangle,
    colorClass: 'text-yellow-500',
    bgColorClass: 'bg-yellow-100 dark:bg-yellow-800/30',
    messages: [
      '老板在办公室，但看起来很忙，没空理你。',
      '小道消息：老板今天心情一般，谨慎行事。',
      '办公室有KPI的紧张气息，建议认真工作至少半小时。',
      '老板的脚步声在走廊回荡，保持警惕！',
    ],
  },
  {
    level: 3,
    name: '高风险',
    Icon: Flame,
    colorClass: 'text-orange-500',
    bgColorClass: 'bg-orange-100 dark:bg-orange-800/30',
    messages: [
      '老板正在巡视！假装努力工作！',
      '紧急通知：老板开始逐个工位检查了！',
      '老板在咆哮，方圆十里都能听到！快！打开你的IDE！',
      '办公室进入一级戒备，非战斗人员请迅速撤离到茶水间。',
    ],
  },
  {
    level: 4,
    name: '极度危险',
    Icon: Skull,
    colorClass: 'text-red-500',
    bgColorClass: 'bg-red-100 dark:bg-red-800/30',
    messages: [
      '老板站在你身后！！！',
      '红色警报！老板指定要找你！快跑！...哦不，快去！',
      '放弃幻想，准备战斗！老板要开全员大会，主题是"奋斗与未来"！',
      '系统提示：您的"摸鱼特权"已被吊销，请立即切换至"卷王模式"。',
    ],
  },
];

function BossRadar(): React.JSX.Element {
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>(riskLevels[0]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const getRandomMessage = (messages: string[]): string => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    setCurrentMessage(getRandomMessage(currentRisk.messages));
  }, [currentRisk]);

  const detectRisk = useCallback(() => {
    setIsDetecting(true);
    // Simulate detection delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * riskLevels.length);
      setCurrentRisk(riskLevels[randomIndex]);
      setIsDetecting(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5s and 2.5s
  }, []);

  return (
    <Card className={cn(
      "w-full max-w-lg mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col items-center",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 w-full">
        <div className="flex items-center justify-center mb-3">
          <ScanLine className="w-12 h-12 text-sky-500 dark:text-sky-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">
          老板雷达 / 危险系数监测
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          实时（模拟）监测办公室危险等级，助您安全摸鱼，高效工作！
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full flex flex-col items-center space-y-6 pt-2">
        <div className={cn(
          "w-full h-48 flex flex-col items-center justify-center rounded-lg p-6 text-center transition-all duration-500 ease-in-out",
          currentRisk.bgColorClass
        )}>
          {isDetecting ? (
            <Loader2 className={cn("w-16 h-16 animate-spin", currentRisk.colorClass)} />
          ) : (
            <currentRisk.Icon className={cn("w-16 h-16 mb-3 transition-transform duration-300 group-hover:scale-110", currentRisk.colorClass)} />
          )}
          <p className={cn("text-2xl font-semibold mt-2", currentRisk.colorClass)}>
            {isDetecting ? '探测中...' : currentRisk.name}
          </p>
        </div>

        <div className="min-h-[60px] text-center px-2 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-md w-full shadow">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                {isDetecting ? "正在扫描附近信号..." : currentMessage}
            </p>
        </div>

        <Button
          onClick={detectRisk}
          disabled={isDetecting}
          className="w-full text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center justify-center group"
        >
          {isDetecting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 探测中...</>
          ) : (
            <><ScanLine className="mr-2 h-5 w-5 group-hover:animate-pulse" /> {currentRisk.level > 2 ? '紧急探测！' : '探测实时风险'}</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default BossRadar;
