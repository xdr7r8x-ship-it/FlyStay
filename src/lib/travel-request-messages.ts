import { prisma } from './prisma';

/**
 * Create a system message for a travel request
 * Used for safe status updates and option events
 */
export async function createSystemMessage(
  requestId: string,
  bodyAr: string,
  visibility: 'USER' | 'INTERNAL' = 'USER',
  messageType: 'TEXT' | 'STATUS' | 'OPTION' = 'TEXT'
) {
  return prisma.travelRequestMessage.create({
    data: {
      requestId,
      senderRole: 'SYSTEM',
      bodyAr,
      visibility,
      messageType,
    },
  });
}

/**
 * Create a message from admin or user
 */
export async function createUserMessage(
  requestId: string,
  senderId: string,
  senderRole: 'ADMIN' | 'USER',
  bodyAr: string,
  visibility: 'USER' | 'INTERNAL' = 'USER'
) {
  return prisma.travelRequestMessage.create({
    data: {
      requestId,
      senderId,
      senderRole,
      bodyAr,
      visibility,
      messageType: 'TEXT',
    },
  });
}

// Safe status labels for system messages
export const STATUS_SYSTEM_MESSAGES: Record<string, string> = {
  NEW: 'تم استلام طلبك الجديد.',
  REVIEWING: 'طلبك قيد المراجعة من قبل فريقنا.',
  OPTIONS_SENT: 'تم تجهيز خيارات أولية للمراجعة. اختيارك لأي خيار لا يعني إتمام الحجز.',
  USER_APPROVED: 'تم استلام اختيارك. سيقوم فريق FlyStay بمراجعة التفاصيل يدويًا قبل أي إجراء.',
  BOOKING_PENDING: 'طلبك بانتظار الإجراء اليدوي من فريقنا.',
  COMPLETED: 'تم إتمام المعاملة من الناحية الإدارية. يرجى التواصل للاستفسارات.',
  CANCELLED: 'تم إلغاء الطلب.',
};

/**
 * Create a safe status change system message
 */
export async function createStatusChangeMessage(
  requestId: string,
  newStatus: string
) {
  const message = STATUS_SYSTEM_MESSAGES[newStatus];
  if (!message) return null;

  return createSystemMessage(requestId, message, 'USER', 'STATUS');
}

/**
 * Get user-visible messages for a request
 */
export async function getUserMessages(requestId: string) {
  return prisma.travelRequestMessage.findMany({
    where: {
      requestId,
      visibility: 'USER',
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      senderRole: true,
      bodyAr: true,
      messageType: true,
      createdAt: true,
    },
  });
}

/**
 * Get all messages (admin only)
 */
export async function getAllMessages(requestId: string) {
  return prisma.travelRequestMessage.findMany({
    where: { requestId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
