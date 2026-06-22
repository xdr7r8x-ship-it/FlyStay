import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Favorites feature coming soon - return empty for now
    return NextResponse.json({ favorites: [] });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
