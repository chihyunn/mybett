'use client';

import { useState, useRef } from 'react';

export default function SettingsPage() {
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
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      {/* Export/Import Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💾</span>
          데이터 백업
        </h2>

        <p className="text-gray-600 text-sm mb-6">
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
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
          <p className="font-medium mb-2">📋 내보내기 포함 항목:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>모든 베팅 기록</li>
            <li>잔액 및 수익 정보</li>
            <li>잔액 변동 히스토리</li>
            <li>스포츠, 팀, 베팅 타입 정보</li>
          </ul>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
          <span className="text-2xl">⚠️</span>
          주의사항
        </h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 가져오기 시 중복 베팅은 자동으로 건너뜁니다.</li>
          <li>• 잔액 정보는 덮어쓰기 됩니다.</li>
          <li>• 가져오기 전 현재 데이터를 먼저 내보내기 하세요.</li>
        </ul>
      </div>
    </div>
  );
}
