/**
 * Provider Status API
 * GET /api/admin/providers/status
 *
 * Returns status of all configured providers WITHOUT exposing secrets.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  flightsProvider,
  hotelsProvider,
  packagesProvider,
  paymentsProvider,
  internalInventoryProvider,
  providerRegistry
} from '@/lib/providers';
import { requireRoles } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // RBAC: Require ADMIN role
  const authResult = await requireRoles(request, ['ADMIN']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    providers: {
      amadeus: {
        name: 'Amadeus Flights',
        configured: flightsProvider.isConfigured(),
        environment: process.env.AMADEUS_ENV || 'test',
      },
      hotelbeds: {
        name: 'Hotelbeds Hotels',
        configured: hotelsProvider.isConfigured(),
        environment: process.env.HOTELBEDS_ENV || 'test',
      },
      packages: {
        name: 'Travel Packages',
        configured: packagesProvider.isConfigured(),
      },
      tap: {
        name: 'Tap Payments',
        configured: paymentsProvider.isConfigured(),
        environment: 'production',
      },
      internalInventory: {
        name: 'Internal Inventory (Chalets)',
        enabled: internalInventoryProvider.isConfigured(),
        serviceType: 'internal',
      },
    },
    health: providerRegistry.getHealth(),
  };

  return NextResponse.json(status);
}
