/**
 * FlyStay Chalets Provider
 * 
 * Alias for Internal Inventory Provider.
 * NO MOCK DATA - Only real inventory added by Admin.
 * FAIL-CLOSED: Returns 503 if provider is not configured.
 */

import { internalInventoryProvider } from './internal-inventory.provider';

export const chaletsProvider = internalInventoryProvider;
