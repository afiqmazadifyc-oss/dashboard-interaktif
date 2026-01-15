'use client';

interface ProfitStatCardProps {
  label: string;
  profit: number;
  percentage: number;
}

export default function ProfitStatCard({ label, profit, percentage }: ProfitStatCardProps) {
  const isProfit = profit >= 0;
  const formattedProfit = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(profit);
  const formattedPercentage = `${isProfit ? '+' : ''}${percentage.toFixed(1)}%`;

  return (
    <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 flex flex-col justify-center items-center text-center">
      <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">{label}</h3>
      <p className={`text-4xl font-extrabold mt-2 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        {formattedProfit}
      </p>
      <span className={`text-lg font-semibold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        {formattedPercentage}
      </span>
    </div>
  );
}