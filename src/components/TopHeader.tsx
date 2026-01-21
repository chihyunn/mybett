'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/predict', label: '예측 입력' },
  { href: '/history', label: '베팅 기록' },
  { href: '/analysis', label: '분석' },
  { href: '/settings', label: '설정' },
];

export default function TopHeader() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="font-bold text-xl text-gray-900">MyBet</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
