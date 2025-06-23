
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
};

export type Room = {
  id:string;
  hotelId: string;
  type: string;
  price: number;
  capacity: number;
  isAvailable: boolean;
  imageUrl: string;
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
  type: 'room' | 'food';
  items: { name: string; quantity: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  orderDate: string;
};

export type Withdrawal = {
  id: string;
  ownerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  requestDate: string;
  processedDate?: string;
};
