import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  || 'http://localhost:4000';

export async function fetchBookings() {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchTours() {
  const res = await fetch(`${API_BASE_URL}/api/tours`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createBooking(data: { userId: number; tourId: number; date: string; people: number }) {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  const result = await res.json();
  
  if (!res.ok) {
    let errorMessage = result.error || 'Failed to create booking';
    
    // If there are detailed validation errors, format them nicely
    if (result.details && Array.isArray(result.details)) {
      const validationMessages = result.details.map((detail: { msg: string }) => detail.msg).join(', ');
      errorMessage = validationMessages;
    }
    
    throw new Error(errorMessage);
  }
  
  return result;
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
  const response = await fetch(`${API_BASE_URL}/api/tours`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tourData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    let errorMessage = error.error || 'Failed to create tour';
    
    // Handle detailed validation errors
    if (error.details && Array.isArray(error.details)) {
      const validationMessages = error.details.map((detail: { msg: string }) => detail.msg).join(', ');
      errorMessage = validationMessages;
    }
    
    throw new Error(errorMessage);
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
  const response = await fetch(`${API_BASE_URL}/api/tours/${tourId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tourData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    let errorMessage = error.error || 'Failed to update tour';
    
    // Handle detailed validation errors
    if (error.details && Array.isArray(error.details)) {
      const validationMessages = error.details.map((detail: { msg: string }) => detail.msg).join(', ');
      errorMessage = validationMessages;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const deleteTour = async (tourId: number) => {
  const response = await fetch(`${API_BASE_URL}/api/tours/${tourId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete tour');
  }
  
  return response.json();
};
