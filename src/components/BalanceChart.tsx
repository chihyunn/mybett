'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface BalanceHistoryItem {
  id: string;
  amount: number;
  profit: number;
  type: string;
  createdAt: string;
}

interface BalanceChartProps {
  data: BalanceHistoryItem[];
  initialAmount: number;
}

// Custom dot component to show different colors for win/loss
const CustomDot = (props: { cx?: number; cy?: number; payload?: { type: string } }) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  if (payload.type === 'INITIAL') {
    return (
      <Dot cx={cx} cy={cy} r={6} fill="#6B7280" stroke="#fff" strokeWidth={2} />
    );
  }

  if (payload.type === 'WIN') {
    return (
      <Dot cx={cx} cy={cy} r={6} fill="#10B981" stroke="#fff" strokeWidth={2} />
    );
  }

  if (payload.type === 'LOSS') {
    return (
      <Dot cx={cx} cy={cy} r={6} fill="#EF4444" stroke="#fff" strokeWidth={2} />
    );
  }

  return <Dot cx={cx} cy={cy} r={4} fill="#3B82F6" />;
};

// Custom tooltip with dark mode support
const CustomTooltip = ({ active, payload, isDark }: { active?: boolean; payload?: Array<{ payload: { dateLabel: string; amount: number; type: string; profit: number } }>; isDark: boolean }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const typeLabel = data.type === 'INITIAL' ? '시작' : data.type === 'WIN' ? '승리' : '패배';
    const typeColor = data.type === 'INITIAL' ? (isDark ? 'text-gray-400' : 'text-gray-600') : data.type === 'WIN' ? 'text-green-500' : 'text-red-500';

    return (
      <div
        className="p-3 shadow-lg rounded-lg border"
        style={{
          background: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb',
          color: isDark ? '#f1f5f9' : '#171717',
        }}
      >
        <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{data.dateLabel}</p>
        <p className="text-lg font-bold">${data.amount.toLocaleString()}</p>
        <p className={`text-sm font-medium ${typeColor}`}>
          {typeLabel}
          {data.type !== 'INITIAL' && (
            <span className="ml-1">
              ({data.profit >= 0 ? '+' : ''}${data.profit.toLocaleString()})
            </span>
          )}
        </p>
      </div>
    );
  }
  return null;
};

export default function BalanceChart({ data, initialAmount }: BalanceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme colors
  const gridColor = isDark ? '#334155' : '#E5E7EB';
  const tickColor = isDark ? '#94a3b8' : '#6B7280';
  const refLineColor = isDark ? '#64748b' : '#9CA3AF';

  // Format data for chart
  const chartData = data.map((item, index) => ({
    ...item,
    index,
    dateLabel: new Date(item.createdAt).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  // Calculate min/max for Y axis
  const amounts = data.map(d => d.amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const padding = (maxAmount - minAmount) * 0.1 || 500;
  const yMin = Math.floor((minAmount - padding) / 100) * 100;
  const yMax = Math.ceil((maxAmount + padding) / 100) * 100;

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center" style={{ color: 'var(--muted)' }}>
        아직 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="index"
            tick={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            axisLine={{ stroke: gridColor }}
            tick={{ fill: tickColor, fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <ReferenceLine
            y={initialAmount}
            stroke={refLineColor}
            strokeDasharray="5 5"
            label={{ value: '시작', fill: refLineColor, fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
