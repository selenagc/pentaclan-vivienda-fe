export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
