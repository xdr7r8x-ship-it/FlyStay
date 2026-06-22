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

export interface ProviderLogEntry {
  timestamp: string;
  provider: ProviderType;
  operation: string;
  status: 'success' | 'error';
  duration: number;
  errorMessage?: string;
}

class ProviderRegistry {
  private healthStatus: Map<ProviderType, { lastSuccess?: Date; lastError?: Date; lastErrorMessage?: string }> = new Map();
  private logs: ProviderLogEntry[] = [];
  private maxLogs = 500;

  isConfigured(type: ProviderType): boolean {
    switch (type) {
      case ProviderType.FLIGHTS:
        return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
      case ProviderType.HOTELS:
        return !!(process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET);
      case ProviderType.PAYMENTS:
        return !!(process.env.TAP_SECRET_KEY && process.env.TAP_PUBLIC_KEY);
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
        return process.env.TAP_ENVIRONMENT === 'production' ? ProviderEnvironment.PRODUCTION : ProviderEnvironment.SANDBOX;
      default:
        return ProviderEnvironment.SANDBOX;
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

  log(provider: ProviderType, operation: string, success: boolean, duration: number, errorMessage?: string): void {
    this.logs.unshift({
      timestamp: new Date().toISOString(),
      provider,
      operation,
      status: success ? 'success' : 'error',
      duration,
      errorMessage,
    });
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(options?: { provider?: ProviderType; status?: string; limit?: number }): ProviderLogEntry[] {
    let filtered = this.logs;
    if (options?.provider) {
      filtered = filtered.filter(l => l.provider === options.provider);
    }
    if (options?.status) {
      filtered = filtered.filter(l => l.status === options.status);
    }
    return filtered.slice(0, options?.limit || 50);
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

  getHealth() {
    return this.getAllHealthStatus();
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
