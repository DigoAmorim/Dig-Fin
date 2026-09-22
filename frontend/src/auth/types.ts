export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthAccount {
  id: string;
  name: string;
  role: string;
}

export interface SessionResponse {
  user: AuthUser;
  account: AuthAccount;
}