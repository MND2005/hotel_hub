
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  joinedDate: string;
};

export type Hotel = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  imageUrls: string[];
  avgRating?: number;
  reviewCount?: number;
  features?: string[];
};

export type Room = {
  id:string;
  hotelId: string;
  type: string;
  price: number;
  capacity: number;
  isAvailable: boolean;
  imageUrls: string[];
  aiHint?: string;
};

export type MenuItem = {
  id: string;
  hotelId: string;
  category: 'breakfast' | 'lunch' | 'dinner';
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  aiHint?: string;
};

export type Order = {
  id: string;
  customerId: string;
  hotelId: string;
  ownerId: string;
  type: 'room' | 'food' | 'combined';
  items: { name: string; quantity: number, price: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  orderDate: string;
  stripeCheckoutSessionId?: string;
};

export type Withdrawal = {
  id: string;
  ownerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  requestDate: string;
  processedDate?: string;
};

export type Review = {
    id: string;
    hotelId: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
};
