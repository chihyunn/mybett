'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mybet-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: '데이터 내보내기 완료!' });
    } catch {
      setMessage({ type: 'error', text: '내보내기 실패' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Import failed');

      setMessage({
        type: 'success',
        text: `가져오기 완료! 베팅 ${result.results.bets}개, 히스토리 ${result.results.balanceHistory}개 추가됨 (${result.results.skipped}개 건너뜀)`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: `가져오기 실패: ${error}` });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>설정</h1>

      {/* Theme Section */}
      <div
        className="rounded-2xl shadow-sm p-6 mb-6"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          borderWidth: '1px'
        }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
          테마 설정
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>다크 모드</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {theme === 'dark' ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Export/Import Section */}
      <div
        className="rounded-2xl shadow-sm p-6"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          borderWidth: '1px'
        }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <span className="text-2xl">💾</span>
          데이터 백업
        </h2>

        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          베팅 기록과 잔액 히스토리를 JSON 파일로 내보내거나 가져올 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium
                     hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <span className="animate-spin">⏳</span>
                내보내는 중...
              </>
            ) : (
              <>
                <span>📤</span>
                데이터 내보내기
              </>
            )}
          </button>

          {/* Import Button */}
          <label
            className={`flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium
                      hover:bg-green-700 transition-colors cursor-pointer
                      flex items-center justify-center gap-2
                      ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {importing ? (
              <>
                <span className="animate-spin">⏳</span>
                가져오는 중...
              </>
            ) : (
              <>
                <span>📥</span>
                데이터 가져오기
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Info */}
        <div
          className="mt-6 p-4 rounded-xl text-sm"
          style={{ background: 'var(--background)', color: 'var(--muted)' }}
        >
          <p className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>📋 내보내기 포함 항목:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>모든 베팅 기록</li>
            <li>잔액 및 수익 정보</li>
            <li>잔액 변동 히스토리</li>
            <li>스포츠, 팀, 베팅 타입 정보</li>
          </ul>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="mt-6 rounded-2xl shadow-sm p-6"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          borderWidth: '1px'
        }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-500">
          <span className="text-2xl">⚠️</span>
          주의사항
        </h2>
        <ul className="text-sm space-y-2" style={{ color: 'var(--muted)' }}>
          <li>• 가져오기 시 중복 베팅은 자동으로 건너뜁니다.</li>
          <li>• 잔액 정보는 덮어쓰기 됩니다.</li>
          <li>• 가져오기 전 현재 데이터를 먼저 내보내기 하세요.</li>
        </ul>
      </div>
    </div>
  );
}
