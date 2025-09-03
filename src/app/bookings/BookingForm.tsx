"use client"

import { useState } from "react";
import { createBooking, fetchUsers, fetchTours } from "@/utils/api";

export default function BookingForm({ onCreated }: { onCreated?: () => void }) {
  const [userId, setUserId] = useState("");
  const [tourId, setTourId] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);
  const [tours, setTours] = useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users and tours on mount
  useState(() => {
    fetchUsers().then(setUsers);
    fetchTours().then(setTours);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createBooking({ userId: Number(userId), tourId: Number(tourId), date, people });
      setUserId("");
      setTourId("");
      setDate("");
      setPeople(1);
      if (onCreated) onCreated();
    } catch (err: unknown) {
      // Extract the specific backend validation message
      const errorMessage = err instanceof Error ? err.message : "Error creating booking";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mb-8 p-4 border rounded bg-white" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">Create Booking</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating booking</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-2">
        <label>User:</label>
        <select value={userId} onChange={e => setUserId(e.target.value)} required>
          <option value="">Select user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label>Tour:</label>
        <select value={tourId} onChange={e => setTourId(e.target.value)} required>
          <option value="">Select tour</option>
          {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label>Date:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div className="mb-2">
        <label>People:</label>
        <input type="number" min={1} value={people} onChange={e => setPeople(Number(e.target.value))} required />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
        {loading ? "Creating..." : "Create Booking"}
      </button>
    </form>
  );
}
