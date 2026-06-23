import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const guide = await prisma.stayGuide.update({
    where: { id: params.id },
    data: body,
  });

  await writeAuditLog({
    request,
    actorId: authResult.user.userId,
    actorRole: authResult.user.role,
    action: body.status === 'INACTIVE' ? 'CONTENT_DEACTIVATED' : 'CONTENT_UPDATED',
    entityType: 'STAY_GUIDE',
    entityId: guide.id,
    details: { titleAr: guide.titleAr, status: guide.status },
  });

  return NextResponse.json({ success: true, data: guide });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  const guide = await prisma.stayGuide.update({
    where: { id: params.id },
    data: { status: 'INACTIVE' },
  });

  await writeAuditLog({
    request,
    actorId: authResult.user.userId,
    actorRole: authResult.user.role,
    action: 'CONTENT_DEACTIVATED',
    entityType: 'STAY_GUIDE',
    entityId: guide.id,
    details: { titleAr: guide.titleAr, status: guide.status },
  });

  return NextResponse.json({ success: true, data: guide });
}
