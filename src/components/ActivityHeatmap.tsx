import React, { useMemo } from 'react';
import { useRustlings } from '../context/RustlingsContext';
import { Tooltip } from './ui/Tooltip';
import { cn } from '../lib/utils';
import { Flame, Calendar, Award, CheckCircle2 } from 'lucide-react';

export const ActivityHeatmap: React.FC = () => {
  const { activityHistory, completedCount } = useRustlings();

  // 52 weeks (364 days, full year) stretching end-to-end of the card
  const { weeks, stats } = useMemo(() => {
    const today = new Date();
    const days: Array<{
      date: string;
      displayDate: string;
      count: number;
      dayOfWeek: number; // 0 = Sun, 6 = Sat
    }> = [];

    const TOTAL_DAYS = 52 * 7; // 364 days
    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const count = activityHistory[dateStr] || 0;
      days.push({
        date: dateStr,
        displayDate,
        count,
        dayOfWeek: d.getDay(),
      });
    }

    // Group into 52 weeks of 7 days
    const weekCols: Array<typeof days> = [];
    let currentWeek: typeof days = [];

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weekCols.push(currentWeek);
    }

    // Calculate streaks & stats
    let totalPractices = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const sortedDates = Object.keys(activityHistory).sort();
    sortedDates.forEach(date => {
      const c = activityHistory[date];
      if (c > 0) {
        totalPractices += c;
        activeDays++;
      }
    });

    let checkDate = new Date(today);
    if ((activityHistory[todayStr] || 0) === 0 && (activityHistory[yesterdayStr] || 0) > 0) {
      checkDate = yesterday;
    }

    while (true) {
      const str = checkDate.toISOString().slice(0, 10);
      if ((activityHistory[str] || 0) > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    days.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    return {
      weeks: weekCols,
      stats: {
        totalPractices: Math.max(totalPractices, completedCount),
        activeDays,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
      },
    };
  }, [activityHistory, completedCount]);

  // Authentic Rust Color Palette: Deep Rust -> Terracotta -> Warm Rust -> Rust Orange
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-[#18181b] border-zinc-800/80';
    if (count <= 2) return 'bg-[#431407]/90 border-[#7c2d12] text-orange-200';
    if (count <= 4) return 'bg-[#9a3412] border-[#c2410c] text-orange-100';
    if (count <= 6) return 'bg-[#ea580c] border-[#f97316] text-white';
    return 'bg-[#f97316] border-orange-400 text-white shadow-xs shadow-orange-500/30';
  };

  return (
    <div className="space-y-3">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block leading-tight">Total Practices</span>
            <span className="text-sm font-semibold font-mono text-zinc-100">{stats.totalPractices}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block leading-tight">Active Days</span>
            <span className="text-sm font-semibold font-mono text-zinc-100">{stats.activeDays}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Flame className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block leading-tight">Current Streak</span>
            <span className="text-sm font-semibold font-mono text-zinc-100">
              {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Award className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block leading-tight">Longest Streak</span>
            <span className="text-sm font-semibold font-mono text-zinc-100">
              {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Card: Spans End-to-End Across the Card */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-200">Practice Activity (Last 52 Weeks)</span>
          <span className="text-[11px] text-zinc-500 font-mono">Saved locally in browser</span>
        </div>

        {/* End-to-End Responsive Container */}
        <div className="w-full">
          <div className="flex w-full items-center gap-1.5">
            {/* Day of week labels on left */}
            <div className="flex flex-col gap-[3px] pr-0.5 text-[9px] text-zinc-500 font-mono select-none shrink-0">
              <span className="h-2.5 leading-2.5">Sun</span>
              <span className="h-2.5 leading-2.5"></span>
              <span className="h-2.5 leading-2.5">Tue</span>
              <span className="h-2.5 leading-2.5"></span>
              <span className="h-2.5 leading-2.5">Thu</span>
              <span className="h-2.5 leading-2.5"></span>
              <span className="h-2.5 leading-2.5">Sat</span>
            </div>

            {/* 52 Columns flex-stretched end-to-end */}
            <div className="flex flex-1 justify-between gap-[3px] min-w-0">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-1 flex-col gap-[3px] min-w-0">
                  {week.map(day => (
                    <Tooltip
                      key={day.date}
                      content={`${day.count > 0 ? `${day.count} exercise${day.count > 1 ? 's' : ''}` : 'No activity'} on ${day.displayDate}`}
                      side="top"
                    >
                      <div
                        className={cn(
                          'w-full aspect-square rounded-[2px] border transition-colors cursor-pointer hover:ring-1 hover:ring-zinc-300',
                          getColorClass(day.count)
                        )}
                      />
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend in Rust Colors */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/50">
          <span>{stats.activeDays} days with completed exercises</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#18181b] border border-zinc-800/80" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#431407]/90 border border-[#7c2d12]" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#9a3412] border border-[#c2410c]" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#ea580c] border border-[#f97316]" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#f97316] border border-orange-400" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
