'use client';

import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useState } from 'react';

const WORK_SESSION_MINUTES = 45;
const SLACK_SESSION_MINUTES = 15;

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(milliseconds: number): string {
  if (milliseconds < 0) return '00:00:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// TODO: Implement the actual UI and logic for Pro Slacker's Time Manager
function ProSlackersTimeManager(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [nextSlackingPeriod, setNextSlackingPeriod] = useState<{ start: Date; end: Date; isSlackingNow: boolean } | null>(null);
  const [timeToNextSlacking, setTimeToNextSlacking] = useState<string>('请设置工作时间');

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const calculateSlackingTimes = useCallback(() => {
    const now = new Date(currentTime); // Use a stable `now` for consistent calculation within this run
    const today = now.toDateString(); // To ensure dates are on the same day

    const getWorkDate = (timeStr: string): Date | null => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;
      const date = new Date(today);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const workStart = getWorkDate(workStartTime);
    const workEnd = getWorkDate(workEndTime);

    if (!workStart || !workEnd || workStart >= workEnd) {
      setNextSlackingPeriod(null);
      setTimeToNextSlacking('请正确设置有效的上班和下班时间。');
      return;
    }

    if (now < workStart) {
      setNextSlackingPeriod(null);
      setTimeToNextSlacking(`摸鱼倒计时: ${formatCountdown(workStart.getTime() - now.getTime())} (还没到班点呢)`);
      return;
    }

    if (now >= workEnd) {
      setNextSlackingPeriod(null);
      setTimeToNextSlacking('已下班，自由摸鱼！🎉');
      return;
    }

    let currentCycleStart = new Date(workStart);
    while (currentCycleStart < workEnd) {
      const workSessionEnd = new Date(currentCycleStart.getTime() + WORK_SESSION_MINUTES * 60000);
      const slackSessionStart = new Date(workSessionEnd);
      const slackSessionEnd = new Date(slackSessionStart.getTime() + SLACK_SESSION_MINUTES * 60000);

      // Ensure slack session doesn't exceed workEnd
      const actualSlackSessionEnd = slackSessionEnd > workEnd ? workEnd : slackSessionEnd;

      if (now < workSessionEnd) { // Currently in a work session or before the first one after workStart
        if (workSessionEnd <= workStart) { // Edge case: if work duration is 0 or negative somehow
             currentCycleStart = new Date(actualSlackSessionEnd);
             continue;
        }
        setNextSlackingPeriod({ start: slackSessionStart, end: actualSlackSessionEnd, isSlackingNow: false });
        setTimeToNextSlacking(formatCountdown(slackSessionStart.getTime() - now.getTime()));
        return;
      }

      if (now < actualSlackSessionEnd) { // Currently in a slack session
        setNextSlackingPeriod({ start: slackSessionStart, end: actualSlackSessionEnd, isSlackingNow: true });
        setTimeToNextSlacking(`摸鱼中! 剩余: ${formatCountdown(actualSlackSessionEnd.getTime() - now.getTime())}`);
        return;
      }
      currentCycleStart = new Date(actualSlackSessionEnd);
    }

    // If loop finishes, it means all slacking periods are done for the day within work hours
    setNextSlackingPeriod(null);
    setTimeToNextSlacking('今日摸鱼已结束，努力奋斗到下班！');

  }, [currentTime, workStartTime, workEndTime]);

  useEffect(() => {
    calculateSlackingTimes();
  }, [calculateSlackingTimes]);

  return (
    <div className={cn(
      "p-6 rounded-lg shadow-xl max-w-md mx-auto",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <h1 className="text-3xl font-bold mb-6 text-sky-600 dark:text-sky-400 text-center">摸鱼时钟 Pro</h1>

      <div className={cn(
        "text-center mb-8 p-4 rounded-lg",
        "bg-neutral-100 dark:bg-neutral-800"
      )}>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">当前时间</p>
        <p className="text-5xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
          {formatTime(currentTime)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={cn("p-3 rounded-md", "bg-neutral-100 dark:bg-neutral-800")}>
          <label htmlFor="workStartTime" className="block text-xs font-medium text-neutral-700 dark:text-neutral-400 mb-1">
            上班时间
          </label>
          <input
            type="time"
            id="workStartTime"
            value={workStartTime}
            onChange={(e) => setWorkStartTime(e.target.value)}
            className={cn(
              "w-full p-2 rounded-md border text-sm",
              "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
              "border-neutral-300 dark:border-neutral-600",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
        <div className={cn("p-3 rounded-md", "bg-neutral-100 dark:bg-neutral-800")}>
          <label htmlFor="workEndTime" className="block text-xs font-medium text-neutral-700 dark:text-neutral-400 mb-1">
            下班时间
          </label>
          <input
            type="time"
            id="workEndTime"
            value={workEndTime}
            onChange={(e) => setWorkEndTime(e.target.value)}
            className={cn(
              "w-full p-2 rounded-md border text-sm",
              "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
              "border-neutral-300 dark:border-neutral-600",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
      </div>

      <div className={cn(
        "p-6 rounded-lg text-center mb-6",
        nextSlackingPeriod?.isSlackingNow ? "bg-green-100 dark:bg-green-700/30" : "bg-neutral-100 dark:bg-neutral-800"
      )}>
        <h2 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2">下一个摸鱼时段</h2>
        {nextSlackingPeriod ? (
          <p className="text-2xl font-mono text-amber-600 dark:text-amber-300">
            {formatTime(nextSlackingPeriod.start)} - {formatTime(nextSlackingPeriod.end)}
          </p>
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">根据您的工作时间表规划中...</p>
        )}
      </div>

      <div className={cn("p-6 rounded-lg text-center", nextSlackingPeriod?.isSlackingNow ? 'animate-pulse' : '')}>
        <h2 className={cn(
          "text-lg font-semibold mb-2",
          nextSlackingPeriod?.isSlackingNow ? "text-green-700 dark:text-green-300" : "text-sky-700 dark:text-sky-300"
        )}>
          {nextSlackingPeriod?.isSlackingNow ? '正在摸鱼' : '距离下次摸鱼'}
        </h2>
        <p className={cn(
          "text-3xl font-mono",
          nextSlackingPeriod?.isSlackingNow ? "text-green-700 dark:text-green-300" : "text-pink-600 dark:text-pink-300"
        )}>
          {timeToNextSlacking}
        </p>
      </div>

      <div className="mt-8 text-center text-xs text-neutral-600 dark:text-neutral-500">
        <p>工作 {WORK_SESSION_MINUTES} 分钟，摸鱼 {SLACK_SESSION_MINUTES} 分钟。劳逸结合，效率更高！</p>
      </div>
    </div>
  );
}

export default ProSlackersTimeManager;
