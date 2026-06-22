import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createOfferSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }
    const user = await getAuthUserFromRequest(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Admin get offers error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_CONFIGURED', message: 'الخدمة غير متاحة حالياً' } },
        { status: 503 }
      );
    }
    const user = await getAuthUserFromRequest(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const body = await request.json();
    const validation = createOfferSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { title, description, code, active } = validation.data;
    
    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        code: code || null,
        active: active ?? true,
      },
    });
    
    return NextResponse.json({ success: true, offer }, { status: 201 });
  } catch (error) {
    console.error('Admin create offer error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
