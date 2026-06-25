import { Role } from '@/generated/prisma';
import { prisma } from './prisma';

async function createNotification(userId: string, title: string, message: string) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
}

async function notifyAdminsAndSupport(title: string, message: string, excludeUserId?: string) {
  const recipients = await prisma.user.findMany({
    where: {
      role: { in: [Role.ADMIN, Role.SUPPORT] },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  if (recipients.length === 0) {
    return { count: 0 };
  }

  await prisma.notification.createMany({
    data: recipients.map((recipient) => ({
      userId: recipient.id,
      title,
      message,
    })),
  });

  return { count: recipients.length };
}

export async function notifyUserNewMessage(userId: string) {
  return createNotification(
    userId,
    'رسالة جديدة من FlyStay',
    'لديك تحديث جديد على طلبك.',
  );
}

export async function notifyAdminNewMessage(excludeUserId?: string) {
  return notifyAdminsAndSupport(
    'رسالة جديدة من مستخدم',
    'يوجد رد جديد على طلب سفر.',
    excludeUserId,
  );
}

export async function notifyUserOptionsReady(userId: string) {
  return createNotification(
    userId,
    'خيارات جاهزة للمراجعة',
    'تم تجهيز خيارات أولية لطلبك.',
  );
}

export async function notifyAdminOptionSelected(excludeUserId?: string) {
  return notifyAdminsAndSupport(
    'اختيار خيار من المستخدم',
    'قام المستخدم باختيار خيار للمراجعة اليدوية.',
    excludeUserId,
  );
}
