"use client"

import { useEffect, useState } from "react";
import { fetchBookings } from "@/utils/api";

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

export default function BookingsList({ onSelect }: { onSelect: (booking: Booking) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings()
      .then((data) => {
        console.log('Bookings API response:', data); // Debug log
        
        // Check if data is an array or has a bookings property
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          console.error('Unexpected bookings data format:', data);
          setError('Received unexpected data format from server');
          setBookings([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  // Group bookings by tour
  const bookingsByTour = bookings.reduce((acc, booking) => {
    const tourTitle = booking.tour.title;
    if (!acc[tourTitle]) {
      acc[tourTitle] = [];
    }
    acc[tourTitle].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  return (
    <div className="space-y-6">
      {Object.entries(bookingsByTour).map(([tourTitle, tourBookings]) => (
        <div key={tourTitle} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            {tourTitle} ({tourBookings.length} booking{tourBookings.length !== 1 ? 's' : ''})
          </h3>
          
          <div className="grid gap-4">
            {tourBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Primary Info */}
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-800">
                      {booking.user ? booking.user.name : booking.guestName || 'Guest'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.user ? booking.user.email : booking.guestEmail || 'No email'}
                    </div>
                  </div>
                  
                  {/* Quantity & Phone */}
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">People:</span> {booking.people}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {booking.guestPhone || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Principal Details */}
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Total:</span> <span className="text-green-600 font-semibold">${booking.total}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions & Date */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      onClick={() => onSelect(booking)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {Object.keys(bookingsByTour).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No bookings found.
        </div>
      )}
    </div>
  );
}
