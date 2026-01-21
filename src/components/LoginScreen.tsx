'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-3xl font-bold text-white mb-2">MyBet</h1>
          <p className="text-gray-400 text-sm">Sports Quant System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="비밀번호 입력"
              className={`w-full px-4 py-4 bg-gray-800 border-2 rounded-xl text-white text-center text-lg placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center mt-2">
                비밀번호가 틀렸습니다
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-lg"
          >
            입장하기
          </button>
        </form>

        <p className="text-gray-600 text-xs text-center mt-8">
          Private Access Only
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
