'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { BarChart3, Clock, Coffee, Pause, Play, RotateCcw, Target } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface WorkMode {
  id: string;
  workMinutes: number;
  breakMinutes: number;
}

interface SessionStats {
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  completedSessions: number;
}

interface Props {
  locale: ValidLocale;
}

const WORK_MODES: Record<string, WorkMode> = {
  pomodoro: { id: 'pomodoro', workMinutes: 25, breakMinutes: 5 },
  extended: { id: 'extended', workMinutes: 45, breakMinutes: 15 },
  sprint: { id: 'sprint', workMinutes: 52, breakMinutes: 17 },
  custom: { id: 'custom', workMinutes: 30, breakMinutes: 10 },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number, locale: ValidLocale): string {
  if (minutes < 60) {
    return locale === 'zh-CN' ? `${minutes}分钟` : `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (locale === 'zh-CN') {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  } else {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
}

function formatCountdown(milliseconds: number): string {
  if (milliseconds < 0) return '00:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const ProSlackersTimeManager: React.FC<Props> = ({ locale }) => {
  const { t, loading } = useTranslations(locale);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  // Work settings
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [selectedMode, setSelectedMode] = useState('pomodoro');
  const [customWorkMinutes, setCustomWorkMinutes] = useState(30);
  const [customBreakMinutes, setCustomBreakMinutes] = useState(10);
  const [currentTask, setCurrentTask] = useState('');

  // Timer state
  const [isWorking, setIsWorking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalWorkTime: 0,
    totalBreakTime: 0,
    completedSessions: 0
  });

  const currentMode = selectedMode === 'custom'
    ? { id: 'custom', workMinutes: customWorkMinutes, breakMinutes: customBreakMinutes }
    : WORK_MODES[selectedMode];

  useEffect(() => {
    setIsMounted(true);
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Session completed
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);

    if (isWorking) {
      // Work session completed, start break
      setSessionStats(prev => ({
        ...prev,
        totalWorkTime: prev.totalWorkTime + currentMode.workMinutes,
        completedSessions: prev.completedSessions + 1
      }));
      setIsWorking(false);
      setTimeLeft(currentMode.breakMinutes * 60);

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t('proSlackersTimeManager.notifications.workComplete'), {
          body: t('proSlackersTimeManager.notifications.breakTime'),
          icon: '/favicon.ico'
        });
      }
    } else {
      // Break session completed, ready for work
      setSessionStats(prev => ({
        ...prev,
        totalBreakTime: prev.totalBreakTime + currentMode.breakMinutes
      }));
      setIsWorking(true);
      setTimeLeft(currentMode.workMinutes * 60);

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t('proSlackersTimeManager.notifications.breakComplete'), {
          body: t('proSlackersTimeManager.notifications.workTime'),
          icon: '/favicon.ico'
        });
      }
    }
  }, [isWorking, currentMode, t]);

  const startWork = () => {
    setIsWorking(true);
    setTimeLeft(currentMode.workMinutes * 60);
    setIsActive(true);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const startBreak = () => {
    setIsWorking(false);
    setTimeLeft(currentMode.breakMinutes * 60);
    setIsActive(true);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsWorking(false);
  };

  const resetStats = () => {
    setSessionStats({
      totalWorkTime: 0,
      totalBreakTime: 0,
      completedSessions: 0
    });
  };

  const calculateEfficiency = () => {
    const totalTime = sessionStats.totalWorkTime + sessionStats.totalBreakTime;
    if (totalTime === 0) return 0;
    return Math.round((sessionStats.totalWorkTime / totalTime) * 100);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!isMounted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            <Clock className="mr-2 h-8 w-8 text-sky-600" />
            {t('proSlackersTimeManager.title')}
          </CardTitle>
          <CardDescription className="text-lg">
            {t('proSlackersTimeManager.description')}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Time */}
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-2">{t('proSlackersTimeManager.currentTime')}</p>
              <p className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatTime(currentTime)}
              </p>
            </CardContent>
          </Card>

          {/* Timer Display */}
          <Card>
            <CardContent className="text-center py-8">
              <div className={cn(
                "mb-6 p-8 rounded-full mx-auto w-64 h-64 flex flex-col items-center justify-center",
                isWorking ? "bg-blue-50 dark:bg-blue-900/20" : "bg-green-50 dark:bg-green-900/20",
                isActive && "animate-pulse"
              )}>
                {isWorking ? (
                  <Target className="h-12 w-12 text-blue-600 mb-4" />
                ) : (
                  <Coffee className="h-12 w-12 text-green-600 mb-4" />
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isWorking ? t('proSlackersTimeManager.currentlyWorking') : t('proSlackersTimeManager.currentlyResting')}
                  </p>
                  <p className="text-5xl font-mono font-bold">
                    {timeLeft > 0 ? formatCountdown(timeLeft * 1000) : '--:--'}
                  </p>
                  {currentTask && isWorking && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      {currentTask}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                {timeLeft === 0 ? (
                  <>
                    <Button onClick={startWork} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      {t('proSlackersTimeManager.startWork')}
                    </Button>
                    <Button onClick={startBreak} variant="outline" className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      {t('proSlackersTimeManager.startBreak')}
                    </Button>
                  </>
                ) : (
                  <>
                                         <Button onClick={toggleTimer} className="flex items-center gap-2">
                       {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                       {isActive ? (locale === 'zh-CN' ? '暂停' : 'Pause') : (locale === 'zh-CN' ? '继续' : 'Resume')}
                     </Button>
                    <Button onClick={resetTimer} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      {t('proSlackersTimeManager.reset')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings and Stats */}
        <div className="space-y-6">
          {/* Work Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('proSlackersTimeManager.workSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workStart">{t('proSlackersTimeManager.workStartTime')}</Label>
                  <Input
                    id="workStart"
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="workEnd">{t('proSlackersTimeManager.workEndTime')}</Label>
                  <Input
                    id="workEnd"
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>{t('proSlackersTimeManager.workMode')}</Label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pomodoro">{t('proSlackersTimeManager.modes.pomodoro')}</SelectItem>
                    <SelectItem value="extended">{t('proSlackersTimeManager.modes.extended')}</SelectItem>
                    <SelectItem value="sprint">{t('proSlackersTimeManager.modes.sprint')}</SelectItem>
                    <SelectItem value="custom">{t('proSlackersTimeManager.modes.custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedMode === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('proSlackersTimeManager.customWorkMinutes')}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={customWorkMinutes}
                      onChange={(e) => setCustomWorkMinutes(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>{t('proSlackersTimeManager.customBreakMinutes')}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={customBreakMinutes}
                      onChange={(e) => setCustomBreakMinutes(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="currentTask">{t('proSlackersTimeManager.currentTask')}</Label>
                <Textarea
                  id="currentTask"
                  placeholder={t('proSlackersTimeManager.taskPlaceholder')}
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('proSlackersTimeManager.todayStats')}
              </CardTitle>
              <Button onClick={resetStats} variant="ghost" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                   <p className="text-2xl font-bold text-blue-600">{formatDuration(sessionStats.totalWorkTime, locale)}</p>
                   <p className="text-sm text-muted-foreground">{t('proSlackersTimeManager.totalWorkTime')}</p>
                 </div>
                 <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                   <p className="text-2xl font-bold text-green-600">{formatDuration(sessionStats.totalBreakTime, locale)}</p>
                   <p className="text-sm text-muted-foreground">{t('proSlackersTimeManager.totalBreakTime')}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{sessionStats.completedSessions}</p>
                  <p className="text-sm text-muted-foreground">{t('proSlackersTimeManager.completedSessions')}</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{calculateEfficiency()}%</p>
                  <p className="text-sm text-muted-foreground">{t('proSlackersTimeManager.efficiency')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProSlackersTimeManager;
