interface UserProfile {
  avatar_url: string | null;
  description: string | null;
  about: string | null;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  profile: UserProfile | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  status: AuthStatus;
}
