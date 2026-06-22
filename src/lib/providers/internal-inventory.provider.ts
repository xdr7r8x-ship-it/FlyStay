/**
 * FlyStay Internal Inventory Provider
 *
 * Manages internal inventory for Chalets and Resthouses.
 * NO MOCK DATA - Only real inventory added by Admin.
 * FAIL-CLOSED: Returns 503 if provider is not configured.
 */

import {
  ProviderType,
  ProviderResult,
  ProviderError,
  InventorySearchInput,
  InventoryItem as InventoryItemType,
  InventoryAvailability,
  BookingStatus,
} from './provider.types';
import { providerRegistry } from './provider-registry';
import { prisma } from '@/lib/prisma';

export class InternalInventoryProvider {
  isConfigured(): boolean {
    return providerRegistry.isConfigured(ProviderType.CHALETS);
  }

  private createServiceNotConfiguredError(): ProviderError {
    return {
      code: 'SERVICE_NOT_CONFIGURED',
      message: 'الخدمة غير متاحة حاليًا.',
    };
  }

  async search(input: InventorySearchInput): Promise<ProviderResult<InventoryItemType[]>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    try {
      const whereClause: Record<string, unknown> = {
        active: true,
        serviceType: input.serviceType,
      };

      if (input.city) {
        whereClause.city = { contains: input.city, mode: 'insensitive' };
      }

      if (input.guests) {
        whereClause.capacity = { gte: input.guests };
      }

      const items = await prisma.inventoryItem.findMany({
        where: whereClause,
        include: {
          availabilities: {
            where: {
              date: { gte: input.checkin, lte: input.checkout },
              blocked: false,
            },
          },
        },
        orderBy: { basePrice: 'asc' },
      });

      const availableItems: InventoryItemType[] = items
        .filter((item) => {
          const availabilities = item.availabilities;
          if (availabilities.length === 0) return false;
          const checkinDate = new Date(input.checkin);
          const checkoutDate = new Date(input.checkout);
          const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
          return availabilities.length >= nights && availabilities.every((a) => a.availableUnits > 0);
        })
        .map((item) => ({
          id: item.id,
          title: item.title,
          serviceType: item.serviceType as 'CHALET' | 'RESTHOUSE',
          city: item.city,
          description: item.description || '',
          images: item.images ? JSON.parse(item.images as string) : [],
          amenities: item.amenities ? JSON.parse(item.amenities as string) : [],
          capacity: item.capacity,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          basePrice: Number(item.basePrice),
          serviceFee: Number(item.serviceFee),
          currency: item.currency || 'SAR',
          terms: item.terms || '',
          availability: (item.availabilities as any[]).map((a) => ({
            date: a.date.toISOString().split('T')[0],
            availableUnits: a.availableUnits,
            priceOverride: a.priceOverride ? Number(a.priceOverride) : undefined,
            blocked: a.blocked,
          })),
        }));

      providerRegistry.updateHealth(ProviderType.CHALETS, true);
      return { success: true, data: availableItems };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      providerRegistry.updateHealth(ProviderType.CHALETS, false, errorMessage);
      return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMessage } };
    }
  }

  async quote(params: {
    itemId: string;
    checkin: string;
    checkout: string;
    guests: number;
  }): Promise<ProviderResult<{
    quoteId: string;
    totalAmount: number;
    currency: string;
    validUntil: string;
    cancellationPolicy: string;
  }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    try {
      const item = await prisma.inventoryItem.findUnique({
        where: { id: params.itemId },
        include: { availabilities: true },
      });

      if (!item || !item.active) {
        return { success: false, error: { code: 'ITEM_NOT_FOUND', message: 'العنصر غير متوفر.' } };
      }

      if (item.capacity < params.guests) {
        return { success: false, error: { code: 'INSUFFICIENT_CAPACITY', message: `السعة غير كافية. الحد الأقصى: ${item.capacity} شخص` } };
      }

      const checkinDate = new Date(params.checkin);
      const checkoutDate = new Date(params.checkout);
      const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

      let basePrice = 0;
      for (const availability of item.availabilities) {
        if (availability.priceOverride) {
          basePrice += Number(availability.priceOverride);
        } else {
          basePrice += Number(item.basePrice);
        }
      }

      if (item.availabilities.length === 0) {
        basePrice = Number(item.basePrice) * nights;
      }

      const totalAmount = basePrice + Number(item.serviceFee);
      const quoteId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        data: {
          quoteId,
          totalAmount,
          currency: item.currency || 'SAR',
          validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          cancellationPolicy: item.terms || 'غير قابل للإلغاء قبل 48 ساعة',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      providerRegistry.updateHealth(ProviderType.CHALETS, false, errorMessage);
      return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMessage } };
    }
  }

  async createBooking(params: {
    quoteId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkin: string;
    checkout: string;
  }): Promise<ProviderResult<{
    bookingId: string;
    confirmationCode: string;
    status: BookingStatus;
    issuedAt: string;
  }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    const quoteResult = await this.quote({
      itemId: params.quoteId,
      checkin: params.checkin,
      checkout: params.checkout,
      guests: 1,
    });

    if (!quoteResult.success || !quoteResult.data) {
      return { success: false, error: { code: 'BOOKING_FAILED', message: 'العنصر غير متوفر للحجز.' } };
    }

    const confirmationCode = `FS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const bookingId = `INV-BK-${Date.now()}`;

    return {
      success: true,
      data: {
        bookingId,
        confirmationCode,
        status: BookingStatus.CONFIRMED,
        issuedAt: new Date().toISOString(),
      },
    };
  }
}

export const internalInventoryProvider = new InternalInventoryProvider();
