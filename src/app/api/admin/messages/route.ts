import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get all travel request messages grouped by user
    const messages = await prisma.travelRequestMessage.findMany({
      where: {
        visibility: 'USER',
      },
      include: {
        request: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by user/conversation
    const conversationsMap = new Map<string, {
      id: string;
      requestId?: string;
      userId: string;
      userName?: string;
      userEmail?: string;
      lastMessage: string;
      lastMessageAt: string;
      unreadCount: number;
      messages: any[];
    }>();

    for (const msg of messages) {
      const key = msg.request.userId;
      const requestKey = msg.requestId;
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          id: key,
          requestId: requestKey,
          userId: msg.request.userId,
          userName: msg.request.user.name,
          userEmail: msg.request.user.email,
          lastMessage: msg.bodyAr,
          lastMessageAt: msg.createdAt.toISOString(),
          unreadCount: 0,
          messages: [],
        });
      }

      const conv = conversationsMap.get(key)!;
      conv.messages.push({
        id: msg.id,
        requestId: msg.requestId,
        userId: msg.request.userId,
        userName: msg.request.user.name,
        userEmail: msg.request.user.email,
        body: msg.bodyAr,
        senderRole: msg.senderRole,
        isRead: true, // For now, read status isn't tracked in this model
        createdAt: msg.createdAt.toISOString(),
      });

      // Update last message if newer
      if (new Date(msg.createdAt) > new Date(conv.lastMessageAt)) {
        conv.lastMessage = msg.bodyAr;
        conv.lastMessageAt = msg.createdAt.toISOString();
      }
    }

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'خطأ في服务器' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { conversationId, userId, requestId, body: messageBody } = body;

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });
    }

    // If requestId provided, add message to that request
    if (requestId) {
      const message = await prisma.travelRequestMessage.create({
        data: {
          requestId,
          senderId: user.userId,
          senderRole: 'ADMIN',
          bodyAr: messageBody.trim(),
          visibility: 'USER',
          messageType: 'TEXT',
        },
      });

      return NextResponse.json({ success: true, message });
    }

    // If userId provided without requestId, create a new travel request with message
    if (userId) {
      // Generate reference number
      const count = await prisma.travelRequest.count();
      const referenceNumber = `TR-${Date.now().toString(36).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;

      const travelRequest = await prisma.travelRequest.create({
        data: {
          referenceNumber,
          userId,
          sourceType: 'MANUAL',
          serviceType: 'MIXED',
          status: 'NEW',
          messages: {
            create: {
              senderId: user.userId,
              senderRole: 'ADMIN',
              bodyAr: messageBody.trim(),
              visibility: 'USER',
              messageType: 'TEXT',
            },
          },
        },
        include: {
          messages: true,
        },
      });

      return NextResponse.json({ success: true, conversation: travelRequest });
    }

    return NextResponse.json({ error: 'معرف الطلب أو المستخدم مطلوب' }, { status: 400 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'خطأ في إرسال الرسالة' }, { status: 500 });
  }
}
