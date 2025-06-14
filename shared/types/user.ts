export interface User {
  id: number;
  username: string;
  password_hash?: string; // Not sent to client
  created_at?: string;
  last_login?: string;
}