// file: components/Stats.tsx
import React from 'react';
import { Stats as StatsType } from '../types';

interface StatsProps {
  stats: StatsType;
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Statistics</h3>
      <p>Total Reviews: {stats.totalReviews}</p>
      <p>
        Correct Reviews: {stats.correctReviews} (
        {((stats.correctReviews / stats.totalReviews) * 100 || 0).toFixed(2)}%)
      </p>
      <p>Average Ease: {stats.averageEase.toFixed(2)}</p>
      <p>Streak: {stats.streakDays} days</p>
    </div>
  );
};

export default Stats;
