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
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;

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

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const typeLabel = data.type === 'INITIAL' ? '시작' : data.type === 'WIN' ? '승리' : '패배';
    const typeColor = data.type === 'INITIAL' ? 'text-gray-600' : data.type === 'WIN' ? 'text-green-600' : 'text-red-600';

    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">{data.dateLabel}</p>
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
      <div className="h-64 flex items-center justify-center text-gray-500">
        아직 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="index"
            tick={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            axisLine={{ stroke: '#E5E7EB' }}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={initialAmount}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            label={{ value: '시작', fill: '#9CA3AF', fontSize: 12 }}
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
