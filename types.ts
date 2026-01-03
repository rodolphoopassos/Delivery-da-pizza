
export type PizzaSize = 'P' | 'M' | 'G' | 'F';

export interface SizeConfig {
  id: PizzaSize;
  label: string;
  slices: number;
}

export interface Prices {
  P: number;
  M: number;
  G: number;
  F: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface PizzaFlavor {
  id: string;
  name: string;
  description: string;
  category: string;
  categoria?: string;
  prices: Prices;
  image: string;
}

export interface Drink {
  id: string;
  name: string;
  price: number;
  category: string;
  categoria?: string;
  image: string;
}

export interface User {
  id?: string;
  name: string;
  phone: string;
  address?: string;
}

export interface CartItem {
  cartId: string;
  type: 'pizza' | 'drink';
  flavors: PizzaFlavor[];
  size?: PizzaSize;
  addons: Addon[];
  notes: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id?: string;
  cliente_nome: string;
  cliente_telefone: string;
  endereco_entrega: string;
  forma_pagamento: string;
  valor_total: number;
  itens_pedido: any;
  status: string;
  data_pedido?: string;
  created_at?: string;
}

export interface AIRecommendation {
  text: string;
  productId?: string; // ID do produto sugerido para adicionar direto
}