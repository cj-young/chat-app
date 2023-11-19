interface LoginCredentials {
  identifier: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

type AuthStatus = "unauthenticated" | "signingUp" | "authenticated";
