'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface StreakData {
  globalStreak: number;
  globalLastResults: (0 | 1)[];
  isGlobalWarning: boolean;
  warningTeams: { teamId: string; teamName: string; streak: number }[];
}

export default function StreakWarningBanner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const res = await fetch('/api/analysis/streak');
        const data = await res.json();
        setStreak(data);
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      }
    }
    fetchStreak();
  }, []);

  if (!streak || !streak.isGlobalWarning || dismissed) {
    return null;
  }

  const lossCount = Math.abs(streak.globalStreak);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 text-white"
      style={{
        background: isDark
          ? 'linear-gradient(to right, #991b1b, #7f1d1d)'
          : 'linear-gradient(to right, #dc2626, #b91c1c)',
        boxShadow: isDark ? '0 4px 6px rgba(0,0,0,0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-pulse">⚠️</div>
            <div>
              <div className="font-bold text-lg">
                🔥 {lossCount}연패 경고!
              </div>
              <div className="text-sm" style={{ color: isDark ? '#fecaca' : '#fee2e2' }}>
                최근 {lossCount}경기 연속 패배 중입니다. 베팅 금액이 자동으로 낮춰집니다.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {streak.globalLastResults.slice(0, 5).map((r, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: r === 1
                      ? (isDark ? '#16a34a' : '#22c55e')
                      : (isDark ? '#7f1d1d' : '#991b1b'),
                  }}
                >
                  {r === 1 ? 'W' : 'L'}
                </span>
              ))}
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="transition-colors"
              style={{ color: isDark ? '#fca5a5' : '#fecaca' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#fca5a5' : '#fecaca')}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
