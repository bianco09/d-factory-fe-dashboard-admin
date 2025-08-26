export async function fetchBookings() {
  const res = await fetch('http://localhost:4000/api/bookings');
  return res.json();
}

export async function fetchTours() {
  const res = await fetch('http://localhost:4000/api/tours');
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch('http://localhost:4000/api/users');
  return res.json();
}

export async function createBooking(data: { userId: number; tourId: number; date: string; people: number }) {
  const res = await fetch('http://localhost:4000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

export const createTour = async (tourData: {
  title: string;
  description: string;
  location: string;
  days: number;
  price: number;
  type: string;
  category?: string;
  included?: string[];
  excluded?: string[];
  tourPlans?: Array<{
    day: number;
    title: string;
    description: string;
    included?: string[];
  }>;
}) => {
  const response = await fetch('http://localhost:4000/api/tours', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tourData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create tour');
  }
  
  return response.json();
};
