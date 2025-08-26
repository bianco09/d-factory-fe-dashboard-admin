"use client"

import { useEffect, useState } from "react";
import { fetchBookings } from "@/utils/api";
import CalendarView from "./CalendarView";
import BookingForm from "./BookingForm";

interface Booking {
  id: number;
  user?: { name: string };
  tour?: { title: string };
  date: string;
  people: number;
  total: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    fetchBookings()
      .then(setBookings)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading bookings</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>User</th>
              <th>Tour</th>
              <th>Date</th>
              <th>People</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.user?.name}</td>
                <td>{b.tour?.title}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>{b.people}</td>
                <td>${b.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 className="text-xl font-semibold mt-8 mb-2">Calendar View</h2>
      <CalendarView />
      <h2 className="text-xl font-semibold mt-8 mb-2">Add New Booking</h2>
      <BookingForm onCreated={() => window.location.reload()} />
    </div>
  );
}
