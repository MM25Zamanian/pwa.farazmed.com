export interface UserInterface extends Record<string, unknown> {
  id: number;
  name: string;
  mobile: string;
  email: string;
  card: string;
  mcode: string;
  api_token: string;
  created_at: string;
  updated_at: string;
}
