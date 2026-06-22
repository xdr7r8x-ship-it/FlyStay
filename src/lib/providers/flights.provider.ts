/**
 * FlyStay Flights Provider - Amadeus Integration
 * 
 * Production integration with Amadeus for Flight Offers Search API.
 * NO MOCK DATA - All results come from official Amadeus API.
 * FAIL-CLOSED: Returns 503 if provider is not configured.
 */

import {
  ProviderType,
  ProviderResult,
  ProviderError,
  FlightSearchInput,
  FlightOffer,
  BookingStatus,
} from './provider.types';
import { providerRegistry } from './provider-registry';

const PROVIDER_NAME = 'Amadeus';

class FlightsProvider {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  isConfigured(): boolean {
    return providerRegistry.isConfigured(ProviderType.FLIGHTS);
  }

  private createServiceNotConfiguredError(): ProviderError {
    return {
      code: 'SERVICE_NOT_CONFIGURED',
      message: 'الخدمة غير متاحة حاليًا، سيتم تفعيلها بعد اعتماد مزود الحجز الرسمي.',
    };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('SERVICE_NOT_CONFIGURED');
    }

    const baseUrl = process.env.AMADEUS_BASE_URL || 'https://api.amadeus.com';
    const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    });

    if (!response.ok) {
      providerRegistry.updateHealth(ProviderType.FLIGHTS, false, 'Auth failed');
      throw new Error('SERVICE_NOT_CONFIGURED');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
    providerRegistry.updateHealth(ProviderType.FLIGHTS, true);
    return this.accessToken as string;
  }

  async search(input: FlightSearchInput): Promise<ProviderResult<FlightOffer[]>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = process.env.AMADEUS_BASE_URL || 'https://api.amadeus.com';

      const params = new URLSearchParams({
        originLocationCode: input.originLocationCode,
        destinationLocationCode: input.destinationLocationCode,
        departureDate: input.departureDate,
        adults: input.adults.toString(),
        currencyCode: input.currencyCode || 'SAR',
        max: '50',
      });

      if (input.returnDate) params.append('returnDate', input.returnDate);
      if (input.children) params.append('children', input.children.toString());
      if (input.infants) params.append('infants', input.infants.toString());
      if (input.travelClass) params.append('travelClass', input.travelClass);
      if (input.nonStop) params.append('nonStop', 'true');
      if (input.maxPrice) params.append('maxPrice', input.maxPrice.toString());

      const response = await fetch(`${baseUrl}/v2/shopping/flight-offers?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.errors?.[0]?.detail || response.statusText;
        providerRegistry.updateHealth(ProviderType.FLIGHTS, false, errorMsg);
        return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMsg } };
      }

      const data = await response.json();
      providerRegistry.updateHealth(ProviderType.FLIGHTS, true);
      return { success: true, data: data.data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage === 'SERVICE_NOT_CONFIGURED') {
        return { success: false, error: this.createServiceNotConfiguredError() };
      }
      providerRegistry.updateHealth(ProviderType.FLIGHTS, false, errorMessage);
      return { success: false, error: { code: 'PROVIDER_ERROR', message: errorMessage } };
    }
  }

  async quote(offerIds: string[]): Promise<ProviderResult<{ quoteId: string; validUntil: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Quote requires full offer details' } };
  }

  async createBooking(params: {
    offerId: string;
    travelers: Array<{
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      email: string;
      phone: string;
    }>;
    contactEmail: string;
    contactPhone: string;
  }): Promise<ProviderResult<{ bookingId: string; confirmationCode: string; status: BookingStatus }>> {
    if (!this.isConfigured()) {
      return { success: false, error: this.createServiceNotConfiguredError() };
    }
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Booking requires full Amadeus integration' } };
  }
}

export const flightsProvider = new FlightsProvider();
