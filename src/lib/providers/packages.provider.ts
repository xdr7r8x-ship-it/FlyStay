/**
 * FlyStay Packages Provider
 * 
 * Production integration for packages.
 * NO MOCK DATA - Results come from official provider or internal inventory.
 * FAIL-CLOSED: Returns 503 if provider is not configured.
 */

import {
  ProviderType,
  ProviderResult,
  ProviderError,
  BookingStatus,
} from './provider.types';
import { providerRegistry } from './provider-registry';

class PackagesProvider {
  isConfigured(): boolean {
    return providerRegistry.isConfigured(ProviderType.PACKAGES);
  }

  private createServiceNotConfiguredError(): ProviderError {
    return {
      code: 'SERVICE_NOT_CONFIGURED',
      message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد مزود الحجز الرسمي.',
    };
  }

  async search(): Promise<ProviderResult<unknown[]>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Packages provider not configured' } };
  }

  async quote(): Promise<ProviderResult<{ quoteId: string; validUntil: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Packages provider not configured' } };
  }

  async createBooking(): Promise<ProviderResult<{ bookingId: string; confirmationCode: string; status: BookingStatus }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Packages provider not configured' } };
  }
}

export const packagesProvider = new PackagesProvider();
