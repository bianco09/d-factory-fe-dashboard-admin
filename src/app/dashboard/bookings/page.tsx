"use client"

import { useState } from "react";
import BookingsList from "./BookingsList";
import BookingDetails from "./BookingDetails";
import Link from "next/link";

interface Booking {
  id: number;
  tour: { title: string };
  user: { name: string; email?: string } | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  date: string;
  people: number;
  status: string;
  total: number;
}

export default function DashboardBookings() {
  const [selected, setSelected] = useState<Booking | null>(null);
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Bookings</h2>
        <Link href="/dashboard/bookings/calendar" className="px-3 py-1 bg-blue-600 text-white rounded">View Calendar</Link>
      </div>
      <BookingsList onSelect={setSelected} />
      <BookingDetails booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
