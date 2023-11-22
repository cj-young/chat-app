export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthStatus = "unauthenticated" | "signingUp" | "authenticated";
