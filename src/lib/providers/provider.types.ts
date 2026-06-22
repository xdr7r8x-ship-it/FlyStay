/**
 * FlyStay Provider Types
 * 
 * Core types for all booking providers.
 * NO MOCK DATA - All results come from official providers.
 */

export enum ProviderType {
  FLIGHTS = 'FLIGHTS',
  HOTELS = 'HOTELS',
  PACKAGES = 'PACKAGES',
  CHALETS = 'CHALETS',
  RESTHOUSES = 'RESTHOUSES',
  PAYMENTS = 'PAYMENTS',
  INTERNAL = 'INTERNAL',
}

export enum ProviderEnvironment {
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

export enum ProviderStatus {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  CONFIGURED = 'CONFIGURED',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  QUOTED = 'QUOTED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUIRED = 'REFUND_REQUIRED',
  CLOSED = 'CLOSED',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum ServiceType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  PACKAGE = 'PACKAGE',
  CHALET = 'CHALET',
  RESTHOUSE = 'RESTHOUSE',
}

export interface ProviderError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: ProviderError;
}

export interface ProviderHealthStatus {
  providerType: ProviderType;
  providerName: string;
  status: ProviderStatus;
  environment: ProviderEnvironment;
  configured: boolean;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
}

export interface FlightSearchInput {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  maxPrice?: number;
  currencyCode?: string;
}

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  duration: string;
  segments: FlightSegment[];
  price: FlightPrice;
  validatingAirlineCodes: string[];
}

export interface FlightSegment {
  departure: { iataCode: string; terminal?: string; at: string };
  arrival: { iataCode: string; terminal?: string; at: string };
  carrierCode: string;
  number: string;
  aircraft: { code: string; name: string };
  duration: string;
  id: string;
  numberOfStops: number;
}

export interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  totalTaxes: string;
}

export interface HotelSearchInput {
  destination: string;
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  children?: number;
  nationality?: string;
  currency?: string;
  maxPrice?: number;
}

export interface HotelOffer {
  id: string;
  name: string;
  description: string;
  categoryCode: string;
  destination: string;
  coordinates: { latitude: number; longitude: number };
  images: string[];
  rating?: number;
  facilities: string[];
  rooms: HotelRoomOffer[];
  price: HotelPrice;
}

export interface HotelRoomOffer {
  id: string;
  name: string;
  code: string;
  maxOccupancy: number;
  bedTypes: string[];
  price: HotelPrice;
  rateKey: string;
  cancellationPolicy?: string;
  amenities: string[];
}

export interface HotelPrice {
  currency: string;
  netAmount: string;
  grossAmount: string;
  totalAmount: string;
  taxAmount: string;
}

export interface PaymentCreateInput {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  id: string;
  providerPaymentId?: string;
  checkoutUrl: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface InventorySearchInput {
  city?: string;
  serviceType: 'CHALET' | 'RESTHOUSE';
  checkin: string;
  checkout: string;
  guests?: number;
}

export interface InventoryItem {
  id: string;
  title: string;
  serviceType: 'CHALET' | 'RESTHOUSE';
  city: string;
  description: string;
  images: string[];
  amenities: string[];
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  serviceFee: number;
  currency: string;
  terms: string;
  availability: InventoryAvailability[];
}

export interface InventoryAvailability {
  date: string;
  availableUnits: number;
  priceOverride?: number;
  blocked: boolean;
}

export interface QuoteResult {
  quoteId: string;
  totalAmount: number;
  currency: string;
  validUntil: string;
  cancellationPolicy?: string;
}

export interface BookingResult {
  bookingId: string;
  providerBookingId: string;
  confirmationCode: string;
  status: BookingStatus;
  issuedAt: string;
  rawProviderResponse?: Record<string, unknown>;
}
