// Authentication utilities for dashboard

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// Get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Store auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

// Remove auth token
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

// Get stored user info
export function getAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Store user info
export function setAuthUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_user', JSON.stringify(user));
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getAuthUser();
  return user?.role === 'ADMIN';
}

// Login function
export async function login(email: string, password: string): Promise<LoginResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
    || 'http://localhost:4000';
      
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  
  // Store token and user info
  setAuthToken(data.token);
  setAuthUser(data.user);
  
  return data;
}

// Logout function
export function logout(): void {
  removeAuthToken();
  window.location.href = '/login';
}

// Get authorization headers for API calls
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  } : {
    'Content-Type': 'application/json',
  };
}
