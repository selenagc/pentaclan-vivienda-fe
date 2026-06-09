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

/** Coincide con LoginOutput del backend: { accessToken, refreshToken, user }. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
