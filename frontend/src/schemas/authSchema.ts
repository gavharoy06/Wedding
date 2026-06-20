import { z } from "zod";

// Register formasi uchun qoidalar
export const registerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgidan iborat bo'lishi kerak"),
  email: z.string().email("Email formati noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
  phone: z.string().optional(),
});

// Login formasi uchun qoidalar
export const loginSchema = z.object({
  email: z.string().email("Email formati noto'g'ri"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

// TypeScript turlarini schema'dan avtomatik chiqarib olamiz
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;