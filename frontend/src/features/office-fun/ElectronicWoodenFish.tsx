'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ElectronicWoodenFishProps {
  locale?: ValidLocale;
}

const LOCAL_STORAGE_KEYS = {
  TODAY_MERIT: 'electronicWoodenFish_todayMerit',
  HISTORICAL_MERIT: 'electronicWoodenFish_historicalMerit',
  LAST_RECORDED_DATE: 'electronicWoodenFish_lastRecordedDate',
};

const ElectronicWoodenFish: React.FC<ElectronicWoodenFishProps> = ({ locale = 'zh-CN' }) => {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [sessionMerit, setSessionMerit] = useState(0);
  const [todayMerit, setTodayMerit] = useState(0);
  const [historicalMerit, setHistoricalMerit] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('positive');
  const [isAnimating, setIsAnimating] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const woodenFishSound = '/sounds/wooden_fish_tap.mp3';
  const woodenFishImage = '/tools_muyu.png';

  // 使用翻译的反馈消息
  const feedbackMessages = React.useMemo(() => [
    { text: t('electronicWoodenFish.feedbackMessages.merit'), type: "positive" },
    { text: t('electronicWoodenFish.feedbackMessages.wealth'), type: "positive" },
    { text: t('electronicWoodenFish.feedbackMessages.wisdom'), type: "positive" },
    { text: t('electronicWoodenFish.feedbackMessages.inspiration'), type: "positive" },
    { text: t('electronicWoodenFish.feedbackMessages.bugFix'), type: "neutral" },
    { text: t('electronicWoodenFish.feedbackMessages.slackingSuccess'), type: "positive" },
    { text: t('electronicWoodenFish.feedbackMessages.badLuckAway'), type: "special" },
    { text: t('electronicWoodenFish.feedbackMessages.worryReduction'), type: "neutral" },
    { text: t('electronicWoodenFish.feedbackMessages.codeSuccess'), type: "positive" },
    { text: t('electronicWoodenFish.feedbackMessages.noRequirementChange'), type: "positive" },
  ], [t, translationsLoading]);

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_RECORDED_DATE);
    let loadedTodayMerit = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.TODAY_MERIT) || '0', 10);
    if (lastDate !== todayStr) {
      loadedTodayMerit = 0;
      localStorage.setItem(LOCAL_STORAGE_KEYS.TODAY_MERIT, '0');
    }
    setTodayMerit(loadedTodayMerit);
    const loadedHistoricalMerit = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORICAL_MERIT) || '0', 10);
    setHistoricalMerit(loadedHistoricalMerit);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_RECORDED_DATE, todayStr);
  }, []);

  const handleClick = useCallback(() => {
    if (translationsLoading || feedbackMessages.length === 0) return;

    setSessionMerit(prev => prev + 1);
    const newTodayMerit = todayMerit + 1;
    setTodayMerit(newTodayMerit);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TODAY_MERIT, newTodayMerit.toString());
    const newHistoricalMerit = historicalMerit + 1;
    setHistoricalMerit(newHistoricalMerit);
    localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORICAL_MERIT, newHistoricalMerit.toString());
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_RECORDED_DATE, new Date().toLocaleDateString());

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
    }

    const randomIndex = Math.floor(Math.random() * feedbackMessages.length);
    setFeedbackText(feedbackMessages[randomIndex].text);
    setFeedbackType(feedbackMessages[randomIndex].type);

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 700);
  }, [todayMerit, historicalMerit, feedbackMessages, translationsLoading]);

  const getFeedbackTextColor = () => {
    switch (feedbackType) {
      case 'positive':
        return 'text-green-500';
      case 'neutral':
        return 'text-yellow-500';
      case 'special':
        return 'text-purple-500';
      default:
        return 'text-blue-500';
    }
  };

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto select-none">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="meditating person" className="mr-2 text-4xl">🧘</span>
          {t('electronicWoodenFish.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('electronicWoodenFish.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pt-2">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {showFeedback && (
            <span
              className={`absolute -top-2 left-1/2 -translate-x-1/2 text-lg font-bold animate-ping-once ${getFeedbackTextColor()}`}
              style={{
                animation: 'ping-once 0.7s cubic-bezier(0, 0, 0.2, 1) forwards'
              }}
            >
              {feedbackText}
            </span>
          )}
          <Image
            src={woodenFishImage}
            alt="Wooden Fish"
            width={180}
            height={180}
            className={`cursor-pointer transition-transform duration-150 ease-in-out ${isAnimating ? 'scale-110' : 'scale-100'}`}
            onClick={handleClick}
            priority
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg">
            {t('electronicWoodenFish.sessionMerit')}<span className="font-bold text-blue-600">{sessionMerit}</span>
          </p>
          <p className="text-lg">
            {t('electronicWoodenFish.todayMerit')}<span className="font-bold text-green-600">{todayMerit}</span>
          </p>
          <p className="text-lg">
            {t('electronicWoodenFish.historicalMerit')}<span className="font-bold text-purple-600">{historicalMerit}</span>
          </p>
        </div>
        <audio ref={audioRef} src={woodenFishSound} preload="auto" />
      </CardContent>
      <style jsx global>{`
        @keyframes ping-once {
          0% {
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
          70%, 100% {
            transform: translate(-50%, -20px) scale(1.2);
            opacity: 0;
          }
        }
        .animate-ping-once {
          animation: ping-once 0.7s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </Card>
  );
};

export default ElectronicWoodenFish;
