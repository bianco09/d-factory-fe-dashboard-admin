"use client"

interface Booking {
  id: number;
  tour: { title: string };
  user: { name: string; email?: string };
  date: string;
  people: number;
  status: string;
  price: number;
}

export default function BookingDetails({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">Booking Details</h3>
        <div className="mb-2"><b>Tour:</b> {booking.tour.title}</div>
        <div className="mb-2"><b>User:</b> {booking.user.name} {booking.user.email && <>({booking.user.email})</>}</div>
        <div className="mb-2"><b>Date:</b> {booking.date}</div>
        <div className="mb-2"><b>People:</b> {booking.people}</div>
        <div className="mb-2"><b>Status:</b> {booking.status}</div>
        <div className="mb-2"><b>Price:</b> ${booking.price}</div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
