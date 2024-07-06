// file: components/Charts.tsx
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '../types';
import { formatDate } from '../utils/dateUtils';

interface ChartsProps {
  reviewData: ChartData[];
  easeData: ChartData[];
}

const Charts: React.FC<ChartsProps> = ({ reviewData, easeData }) => {
  const formattedReviewData = reviewData.map(item => ({
    ...item,
    date: item.date ? formatDate(new Date(item.date)) : '',
  }));

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Review History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedReviewData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="reviews" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3 className="text-lg font-bold my-2">Ease Factor Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={easeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ease" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
