'use client';

import { useEffect, useState } from 'react';

interface StreakData {
  globalStreak: number;
  globalLastResults: (0 | 1)[];
  isGlobalWarning: boolean;
  warningTeams: { teamId: string; teamName: string; streak: number }[];
}

export default function StreakWarningBanner() {
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-pulse">⚠️</div>
            <div>
              <div className="font-bold text-lg">
                🔥 {lossCount}연패 경고!
              </div>
              <div className="text-sm text-red-100">
                최근 {lossCount}경기 연속 패배 중입니다. 베팅 금액이 자동으로 낮춰집니다.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {streak.globalLastResults.slice(0, 5).map((r, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    r === 1 ? 'bg-green-500' : 'bg-red-900'
                  }`}
                >
                  {r === 1 ? 'W' : 'L'}
                </span>
              ))}
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-red-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
