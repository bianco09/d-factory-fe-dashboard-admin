"use client"

import { useState } from "react";
import { createBooking, fetchUsers, fetchTours } from "@/utils/api";

export default function BookingForm({ onCreated }: { onCreated?: () => void }) {
  const [userId, setUserId] = useState("");
  const [tourId, setTourId] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
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
    } catch (err: any) {
      setError(err.message || "Error creating booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mb-8 p-4 border rounded bg-white" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">Create Booking</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
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
