import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const orderDetailsSchema = z.object({
  destination: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  travelers: z.number().optional(),
  guests: z.number().optional(),
  notes: z.string().optional(),
  // Hotel specific
  hotelName: z.string().optional(),
  roomType: z.string().optional(),
  // Flight specific
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  airline: z.string().optional(),
  // Additional
  budget: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

export const createOrderSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(1, 'رقم الجوال مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  serviceType: z.enum(['HOTEL', 'CHALET', 'FLIGHT', 'PACKAGE']),
  date: z.string().optional(),
  travelers: z.number().min(1).max(20).optional(),
  notes: z.string().optional(),
  details: orderDetailsSchema.optional(),
});

export const updateOrderSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  details: orderDetailsSchema.optional(),
});

export const adminUpdateOrderSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'WAITING_USER', 'OFFER_SENT', 'CONFIRMED_MANUALLY', 'CANCELLED', 'CLOSED']).optional(),
  note: z.string().optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  title: z.string().min(1, 'العنوان مطلوب'),
  message: z.string().min(1, 'الرسالة مطلوبة'),
});

export const createOfferSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب'),
  code: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateOfferSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  code: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type AdminUpdateOrderInput = z.infer<typeof adminUpdateOrderSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
