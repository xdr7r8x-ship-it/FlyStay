import { create } from 'zustand';

export type OrderStatus = 'NEW' | 'REVIEWING' | 'WAITING_USER' | 'OFFER_SENT' | 'CONFIRMED_MANUALLY' | 'CANCELLED' | 'CLOSED';
export type ServiceType = 'HOTEL' | 'CHALET' | 'FLIGHT' | 'PACKAGE';

export interface OrderDetails {
  name: string;
  phone: string;
  email: string;
  date?: string;
  travelers?: number;
  notes?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  hotelName?: string;
  roomType?: string;
  from?: string;
  to?: string;
  airline?: string;
  budget?: string;
  preferences?: string[];
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  serviceType: ServiceType;
  details: OrderDetails;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory?: OrderStatusHistory[];
}

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (data: {
    name: string;
    phone: string;
    email: string;
    serviceType: ServiceType;
    date?: string;
    travelers?: number;
    notes?: string;
    details?: Partial<OrderDetails>;
  }) => Promise<Order | null>;
  updateOrder: (id: string, data: Partial<{ name: string; phone: string; notes: string; details: Partial<OrderDetails> }>) => Promise<boolean>;
  clearCurrentOrder: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error || 'حدث خطأ', isLoading: false });
        return;
      }
      
      set({ orders: data.orders, isLoading: false });
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoading: false });
    }
  },
  
  fetchOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error || 'حدث خطأ', isLoading: false });
        return;
      }
      
      set({ currentOrder: data.order, isLoading: false });
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoading: false });
    }
  },
  
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error || 'حدث خطأ', isLoading: false });
        return null;
      }
      
      set((state) => ({
        orders: [data.order, ...state.orders],
        isLoading: false,
      }));
      
      return data.order;
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoading: false });
      return null;
    }
  },
  
  updateOrder: async (id, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error || 'حدث خطأ', isLoading: false });
        return false;
      }
      
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? data.order : o)),
        currentOrder: state.currentOrder?.id === id ? data.order : state.currentOrder,
        isLoading: false,
      }));
      
      return true;
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoading: false });
      return false;
    }
  },
  
  clearCurrentOrder: () => set({ currentOrder: null }),
}));
