'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface BossRadarProps {
  locale: ValidLocale;
}

interface RiskLevel {
  level: number;
  nameKey: string;
  Icon: React.ElementType;
  colorClass: string;
  messagesKey: string;
  bgColorClass: string;
}

function BossRadar({ locale }: BossRadarProps): React.JSX.Element {
  // 1. 翻译 Hook
  const { t, loading: translationsLoading } = useTranslations(locale);

  // 2. 使用 useMemo 稳定 riskLevels 数组
  const riskLevels: RiskLevel[] = useMemo(() => [
    {
      level: 0,
      nameKey: 'bossRadar.riskLevels.absolutelySafe',
      Icon: Smile,
      colorClass: 'text-green-500',
      bgColorClass: 'bg-green-100 dark:bg-green-800/30',
      messagesKey: 'bossRadar.messages.absolutelySafe',
    },
    {
      level: 1,
      nameKey: 'bossRadar.riskLevels.lowRisk',
      Icon: Meh,
      colorClass: 'text-blue-500',
      bgColorClass: 'bg-blue-100 dark:bg-blue-800/30',
      messagesKey: 'bossRadar.messages.lowRisk',
    },
    {
      level: 2,
      nameKey: 'bossRadar.riskLevels.mediumRisk',
      Icon: AlertTriangle,
      colorClass: 'text-yellow-500',
      bgColorClass: 'bg-yellow-100 dark:bg-yellow-800/30',
      messagesKey: 'bossRadar.messages.mediumRisk',
    },
    {
      level: 3,
      nameKey: 'bossRadar.riskLevels.highRisk',
      Icon: Flame,
      colorClass: 'text-orange-500',
      bgColorClass: 'bg-orange-100 dark:bg-orange-800/30',
      messagesKey: 'bossRadar.messages.highRisk',
    },
    {
      level: 4,
      nameKey: 'bossRadar.riskLevels.extremelyDangerous',
      Icon: Skull,
      colorClass: 'text-red-500',
      bgColorClass: 'bg-red-100 dark:bg-red-800/30',
      messagesKey: 'bossRadar.messages.extremelyDangerous',
    },
  ], []);

  // 3. State Hooks
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>(() => riskLevels[0]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // 4. 获取随机消息的函数
  const getRandomMessage = useCallback((messagesKey: string): string => {
    const messages = t(messagesKey, { returnObjects: true }) as string[];
    if (Array.isArray(messages) && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }
    return '';
  }, [t]);

  // 5. Effect Hook
  useEffect(() => {
    setCurrentMessage(getRandomMessage(currentRisk.messagesKey));
  }, [currentRisk, getRandomMessage]);

  // 6. Callback Hook
  const detectRisk = useCallback(() => {
    setIsDetecting(true);
    // Simulate detection delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * riskLevels.length);
      setCurrentRisk(riskLevels[randomIndex]);
      setIsDetecting(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5s and 2.5s
  }, [riskLevels]);

  // 7. 条件渲染 - 在所有 Hooks 之后
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </CardContent>
      </Card>
    );
  }

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
          {t('bossRadar.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          {t('bossRadar.description')}
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
            {isDetecting ? t('bossRadar.detecting') : t(currentRisk.nameKey)}
          </p>
        </div>

        <div className="min-h-[60px] text-center px-2 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-md w-full shadow">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                {isDetecting ? t('bossRadar.scanningSignals') : currentMessage}
            </p>
        </div>

        <Button
          onClick={detectRisk}
          disabled={isDetecting}
          className="w-full text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center justify-center group"
        >
          {isDetecting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('bossRadar.detecting')}</>
          ) : (
            <><ScanLine className="mr-2 h-5 w-5 group-hover:animate-pulse" /> {currentRisk.level > 2 ? t('bossRadar.emergencyDetect') : t('bossRadar.detectRisk')}</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default BossRadar;
