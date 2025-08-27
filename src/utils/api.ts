import { getAuthHeaders } from './auth';

export async function fetchBookings() {
  const res = await fetch('http://localhost:4000/api/bookings', {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchTours() {
  const res = await fetch('http://localhost:4000/api/tours', {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch('http://localhost:4000/api/users', {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createBooking(data: { userId: number; tourId: number; date: string; people: number }) {
  const res = await fetch('http://localhost:4000/api/bookings', {
    method: 'POST',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify(tourData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create tour');
  }
  
  return response.json();
};

export const updateTour = async (tourId: number, tourData: {
  title: string;
  description: string;
  location: string;
  days: number;
  price: number;
  type: string;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  included?: string[];
  excluded?: string[];
  status?: string;
  completionPercentage?: number;
  tourPlans?: Array<{
    day: number;
    title: string;
    description: string;
    included?: string[];
  }>;
}) => {
  const response = await fetch(`http://localhost:4000/api/tours/${tourId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tourData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update tour');
  }
  
  return response.json();
};

export const deleteTour = async (tourId: number) => {
  const response = await fetch(`http://localhost:4000/api/tours/${tourId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete tour');
  }
  
  return response.json();
};
