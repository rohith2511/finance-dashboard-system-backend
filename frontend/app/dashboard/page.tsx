'use client';

import { useState, useEffect } from 'react';
import { getDashboard } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totals: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  };
  categoryTotals: Array<{ category: string; amount: number }>;
  recentTransactions: Array<{
    _id: string;
    amount: number;
    type: string;
    category: string;
    date: string;
  }>;
  monthlyTrends: Array<{ month: string; income: number; expense: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchDashboard(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchDashboard(id: string) {
    try {
      const dashboardData = await getDashboard(id);
      setData(dashboardData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  if (!userId) {
    return (
      <div className="p-8">
        <Link href="/" className="text-blue-600 hover:underline">← Back</Link>
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <p>Please set User ID in localStorage to view dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/" className="text-blue-600 hover:underline mb-4">← Back</Link>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      {data && (
        <>
          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
              <p className="text-2xl font-bold text-green-600">${data.totals.totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-sm font-medium text-gray-600">Total Expense</h3>
              <p className="text-2xl font-bold text-red-600">${data.totals.totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-gray-600">Net Balance</h3>
              <p className={`text-2xl font-bold ${data.totals.netBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                ${data.totals.netBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
              <div className="space-y-2">
                {data.categoryTotals.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-lg font-semibold">${cat.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
              <div className="space-y-2">
                {data.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">{trend.month}</p>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-green-600">Income: ${trend.income.toFixed(2)}</span>
                      <span className="text-red-600">Expense: ${trend.expense.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((txn) => (
                    <tr key={txn._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(txn.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm ${txn.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{txn.category}</td>
                      <td className="px-6 py-4 font-semibold">${txn.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
