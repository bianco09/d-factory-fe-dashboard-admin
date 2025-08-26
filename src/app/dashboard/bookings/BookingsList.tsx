"use client"

import { useEffect, useState } from "react";
import { fetchBookings } from "@/utils/api";

interface Booking {
  id: number;
  tour: { title: string };
  user: { name: string };
  date: string;
  people: number;
  status: string;
  price: number;
}

export default function BookingsList({ onSelect }: { onSelect: (booking: Booking) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading bookings...</div>;

  return (
    <table className="w-full border rounded bg-white">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Tour</th>
          <th className="p-2">User</th>
          <th className="p-2">Date</th>
          <th className="p-2">People</th>
          <th className="p-2">Status</th>
          <th className="p-2">Price</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id} className="border-t">
            <td className="p-2">{b.tour.title}</td>
            <td className="p-2">{b.user.name}</td>
            <td className="p-2">{b.date}</td>
            <td className="p-2">{b.people}</td>
            <td className="p-2">{b.status}</td>
            <td className="p-2">${b.price}</td>
            <td className="p-2">
              <button className="text-blue-600 underline" onClick={() => onSelect(b)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
