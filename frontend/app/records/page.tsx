'use client';

import { useState, useEffect } from 'react';
import { getRecords, createRecord } from '@/lib/api';
import Link from 'next/link';

interface Record {
  _id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({
    amount: '',
    type: 'income',
    category: 'salary',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchRecords(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchRecords(id: string) {
    try {
      const data = await getRecords(id);
      setRecords(data.records || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    try {
      await createRecord(
        userId,
        parseFloat(form.amount),
        form.type,
        form.category,
        form.date,
        form.notes
      );
      setForm({
        amount: '',
        type: 'income',
        category: 'salary',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchRecords(userId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-blue-600 hover:underline mb-4">← Back</Link>
      <h1 className="text-3xl font-bold mb-6">Financial Records</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <form onSubmit={handleCreateRecord} className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Record</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Amount"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            className="px-4 py-2 border rounded"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-4 py-2 border rounded"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            placeholder="Category (e.g., salary, groceries)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="px-4 py-2 border rounded"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="px-4 py-2 border rounded"
          />
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="px-4 py-2 border rounded md:col-span-2"
          />
        </div>
        <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Add Record
        </button>
      </form>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{record.category}</td>
                  <td className="px-6 py-4 font-semibold">${record.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
