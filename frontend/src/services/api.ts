import axios from 'axios';

// Use Vite proxy in development, or explicit URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3000');

axios.defaults.baseURL = API_BASE_URL;

export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data;
  }
};

export const sweetsApi = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await axios.get('/api/sweets');
    return response.data;
  },

  search: async (params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Sweet[]> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    const response = await axios.get(`/api/sweets/search?${queryParams.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Sweet> => {
    const response = await axios.get(`/api/sweets/${id}`);
    return response.data;
  },

  create: async (sweet: Omit<Sweet, 'id' | 'created_at' | 'updated_at'>): Promise<Sweet> => {
    const response = await axios.post('/api/sweets', sweet);
    return response.data;
  },

  update: async (id: number, sweet: Partial<Sweet>): Promise<Sweet> => {
    const response = await axios.put(`/api/sweets/${id}`, sweet);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/api/sweets/${id}`);
  },

  purchase: async (id: number): Promise<Sweet> => {
    const response = await axios.post(`/api/sweets/${id}/purchase`);
    return response.data;
  },

  restock: async (id: number, quantity: number): Promise<Sweet> => {
    const response = await axios.post(`/api/sweets/${id}/restock`, { quantity });
    return response.data;
  }
};

