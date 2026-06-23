import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/admin-audit';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const destination = await prisma.travelDestination.update({
    where: { id: params.id },
    data: { ...body, lastReviewedAt: new Date() },
  });

  await writeAuditLog({
    request,
    actorId: authResult.user.userId,
    actorRole: authResult.user.role,
    action: body.status === 'INACTIVE' ? 'CONTENT_DEACTIVATED' : 'CONTENT_UPDATED',
    entityType: 'TRAVEL_DESTINATION',
    entityId: destination.id,
    details: { slug: destination.slug, status: destination.status },
  });

  return NextResponse.json({ success: true, data: destination });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  const destination = await prisma.travelDestination.update({
    where: { id: params.id },
    data: { status: 'INACTIVE', lastReviewedAt: new Date() },
  });

  await writeAuditLog({
    request,
    actorId: authResult.user.userId,
    actorRole: authResult.user.role,
    action: 'CONTENT_DEACTIVATED',
    entityType: 'TRAVEL_DESTINATION',
    entityId: destination.id,
    details: { slug: destination.slug, status: destination.status },
  });

  return NextResponse.json({ success: true, data: destination });
}
