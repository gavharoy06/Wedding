export type User = {
  user_id: number;
  name: string;
  email: string;
  role: "client" | "owner" | "admin";
  is_verified?: boolean; // qo'shimcha
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // OTP uchun yangi maydonlar
  otpRequired: boolean;
  tempEmail: string | null;
};