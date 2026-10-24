export interface User {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}
