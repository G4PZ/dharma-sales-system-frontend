import { User } from '@/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function loginWithGoogle(idToken: string): Promise<User> {
  const url = `${API_BASE_URL}/api/auth/google`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_token: idToken }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || 'Error al iniciar sesión con Google'
    );
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const url = `${API_BASE_URL}/api/auth/me`;
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Sesión no válida o no iniciada');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const url = `${API_BASE_URL}/api/auth/logout`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al cerrar la sesión');
  }
}
