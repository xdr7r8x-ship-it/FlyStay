import {
  ProviderType,
  ProviderResult,
  ProviderError,
  InventorySearchInput,
  InventoryItem as InventoryItemType,
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
      const items = await prisma.inventoryItem.findMany({
        where: {
          active: true,
          serviceType: input.serviceType,
          ...(input.city ? { city: { contains: input.city, mode: 'insensitive' as const } } : {}),
          ...(input.guests ? { capacity: { gte: input.guests } } : {}),
        },
        include: {
          availabilities: {
            where: {
              date: { gte: new Date(input.checkin), lte: new Date(input.checkout) },
              blocked: false,
            },
          },
        },
        orderBy: { basePrice: 'asc' },
      });

      const availableItems = items
        .filter((item) => {
          const checkinDate = new Date(input.checkin);
          const checkoutDate = new Date(input.checkout);
          const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
          return item.availabilities.length >= nights && item.availabilities.every((a) => a.availableUnits > 0);
        })
        .map((item) => ({
          id: item.id,
          title: item.title,
          serviceType: item.serviceType as 'CHALET' | 'RESTHOUSE',
          city: item.city,
          description: item.description || '',
          images: Array.isArray(item.images) ? item.images as string[] : [],
          amenities: Array.isArray(item.amenities) ? item.amenities as string[] : [],
          capacity: item.capacity,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          basePrice: Number(item.basePrice),
          serviceFee: Number(item.serviceFee),
          currency: item.currency || 'SAR',
          terms: item.terms || '',
          availability: item.availabilities.map((availability) => ({
            date: availability.date.toISOString().split('T')[0],
            availableUnits: availability.availableUnits,
            priceOverride: availability.priceOverride ? Number(availability.priceOverride) : undefined,
            blocked: availability.blocked,
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
        include: {
          availabilities: {
            where: {
              date: { gte: new Date(params.checkin), lte: new Date(params.checkout) },
              blocked: false,
            },
          },
        },
      });

      if (!item || !item.active) {
        return { success: false, error: { code: 'ITEM_NOT_FOUND', message: 'العنصر غير متاح.' } };
      }
      if (item.capacity < params.guests) {
        return { success: false, error: { code: 'INSUFFICIENT_CAPACITY', message: 'السعة غير كافية.' } };
      }

      const checkinDate = new Date(params.checkin);
      const checkoutDate = new Date(params.checkout);
      const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      if (item.availabilities.length < nights) {
        return { success: false, error: { code: 'NOT_AVAILABLE', message: 'لا توجد إتاحة كافية من قاعدة البيانات.' } };
      }

      const totalAmount = item.availabilities.reduce((sum, availability) => {
        return sum + Number(availability.priceOverride || item.basePrice);
      }, Number(item.serviceFee));

      return {
        success: true,
        data: {
          quoteId: item.id,
          totalAmount,
          currency: item.currency || 'SAR',
          validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          cancellationPolicy: item.terms || 'تتم مراجعة الشروط قبل أي تأكيد نهائي.',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      providerRegistry.updateHealth(ProviderType.CHALETS, false, errorMessage);
      return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMessage } };
    }
  }

  async createBooking(): Promise<ProviderResult<never>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    return {
      success: false,
      error: {
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'خدمة تأكيد حجوزات الإقامات غير مفعلة حاليًا.',
      },
    };
  }
}

export const internalInventoryProvider = new InternalInventoryProvider();
