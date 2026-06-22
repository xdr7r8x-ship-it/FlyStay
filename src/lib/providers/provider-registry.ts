/**
 * FlyStay Provider Registry
 * 
 * Manages provider configuration and health status.
 * All secrets come from environment variables only.
 * NO MOCK DATA - All results come from official providers.
 */

import {
  ProviderType,
  ProviderEnvironment,
  ProviderStatus,
  ProviderHealthStatus,
} from './provider.types';

export interface ProviderConfig {
  type: ProviderType;
  name: string;
  environment: ProviderEnvironment;
  configured: boolean;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  webhookSecret?: string;
}

class ProviderRegistry {
  private healthStatus: Map<ProviderType, { lastSuccess?: Date; lastError?: Date; lastErrorMessage?: string }> = new Map();

  isConfigured(type: ProviderType): boolean {
    switch (type) {
      case ProviderType.FLIGHTS:
        return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
      case ProviderType.HOTELS:
        return !!(process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET);
      case ProviderType.PAYMENTS:
        return !!(process.env.TAP_SECRET_KEY && process.env.TAP_PUBLIC_KEY && process.env.TAP_WEBHOOK_SECRET);
      case ProviderType.PACKAGES:
        return !!(process.env.PACKAGES_API_KEY && process.env.PACKAGES_API_BASE_URL);
      case ProviderType.CHALETS:
      case ProviderType.RESTHOUSES:
      case ProviderType.INTERNAL:
        return process.env.INTERNAL_INVENTORY_ENABLED === 'true';
      default:
        return false;
    }
  }

  getEnvironment(type: ProviderType): ProviderEnvironment {
    switch (type) {
      case ProviderType.FLIGHTS:
        return process.env.AMADEUS_ENV === 'production' ? ProviderEnvironment.PRODUCTION : ProviderEnvironment.SANDBOX;
      case ProviderType.HOTELS:
        return process.env.HOTELBEDS_ENV === 'production' ? ProviderEnvironment.PRODUCTION : ProviderEnvironment.SANDBOX;
      case ProviderType.PAYMENTS:
        return process.env.TAP_ENV === 'production' ? ProviderEnvironment.PRODUCTION : ProviderEnvironment.SANDBOX;
      default:
        return ProviderEnvironment.PRODUCTION;
    }
  }

  getStatus(type: ProviderType): ProviderStatus {
    if (!this.isConfigured(type)) {
      return ProviderStatus.NOT_CONFIGURED;
    }
    const health = this.healthStatus.get(type);
    if (health?.lastError && (!health.lastSuccess || health.lastError > health.lastSuccess)) {
      return ProviderStatus.ERROR;
    }
    return ProviderStatus.ACTIVE;
  }

  updateHealth(type: ProviderType, success: boolean, errorMessage?: string): void {
    const current = this.healthStatus.get(type) || {};
    if (success) {
      this.healthStatus.set(type, { ...current, lastSuccess: new Date(), lastError: undefined, lastErrorMessage: undefined });
    } else {
      this.healthStatus.set(type, { ...current, lastError: new Date(), lastErrorMessage: errorMessage });
    }
  }

  getHealthStatus(type: ProviderType): ProviderHealthStatus {
    const health = this.healthStatus.get(type);
    const providerNames: Record<ProviderType, string> = {
      [ProviderType.FLIGHTS]: 'Amadeus',
      [ProviderType.HOTELS]: 'Hotelbeds',
      [ProviderType.PACKAGES]: 'FlyStay Packages',
      [ProviderType.CHALETS]: 'FlyStay Chalets',
      [ProviderType.RESTHOUSES]: 'FlyStay Resthouses',
      [ProviderType.PAYMENTS]: 'Tap Payments',
      [ProviderType.INTERNAL]: 'Internal Inventory',
    };

    return {
      providerType: type,
      providerName: providerNames[type],
      status: this.getStatus(type),
      environment: this.getEnvironment(type),
      configured: this.isConfigured(type),
      lastSuccessAt: health?.lastSuccess?.toISOString(),
      lastErrorAt: health?.lastError?.toISOString(),
      lastErrorMessage: health?.lastErrorMessage,
    };
  }

  getAllHealthStatus(): ProviderHealthStatus[] {
    return Object.values(ProviderType).map(type => this.getHealthStatus(type));
  }

  getWebhookSecret(): string | undefined {
    return process.env.TAP_WEBHOOK_SECRET;
  }
}

export const providerRegistry = new ProviderRegistry();

export function isProviderReady(type: ProviderType): boolean {
  return providerRegistry.getStatus(type) === ProviderStatus.ACTIVE;
}

export function isProviderConfigured(type: ProviderType): boolean {
  return providerRegistry.isConfigured(type);
}
