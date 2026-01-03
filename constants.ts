
import { PizzaFlavor, Drink, SizeConfig, Addon } from './types';

export const SIZES: SizeConfig[] = [
  { id: 'P', label: 'Pequena', slices: 4 },
  { id: 'M', label: 'Média', slices: 6 },
  { id: 'G', label: 'Grande', slices: 8 },
  { id: 'F', label: 'Família', slices: 12 },
];

export const PIZZA_FLAVORS: PizzaFlavor[] = [
  {
    id: '1',
    name: 'Calabresa',
    description: 'Calabresa, cebola, mussarela, molho de tomate e orégano, azeitona.',
    category: 'Tradicional',
    prices: { P: 24.99, M: 29.99, G: 34.99, F: 44.99 },
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Frango',
    description: 'Frango desfiado, mussarela, molho de tomate e orégano.',
    category: 'Tradicional',
    prices: { P: 24.99, M: 29.99, G: 34.99, F: 44.99 },
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=401'
  },
  {
    id: '3',
    name: 'Mussarela',
    description: 'Mussarela, molho de tomate e orégano.',
    category: 'Tradicional',
    prices: { P: 24.99, M: 29.99, G: 34.99, F: 44.99 },
    image: 'https://images.unsplash.com/photo-1573821663912-5699047e767b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '4',
    name: 'Bacon',
    description: 'Bacon, mussarela, molho de tomate e orégano.',
    category: 'Tradicional',
    prices: { P: 24.99, M: 29.99, G: 34.99, F: 44.99 },
    image: 'https://images.unsplash.com/photo-1593504049359-74330189a355?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '5',
    name: 'Portuguesa',
    description: 'Presunto, ovos, cebola, pimentão, azeitonas, mussarela e molho.',
    category: 'Tradicional',
    prices: { P: 24.99, M: 29.99, G: 34.99, F: 44.99 },
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '6',
    name: 'Frango com Catupiry',
    description: 'Frango desfiado, Catupiry, mussarela, molho de tomate e orégano.',
    category: 'Especial',
    prices: { P: 27.99, M: 32.99, G: 37.99, F: 47.99 },
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '7',
    name: 'Calabresa Nordestina',
    description: 'Calabresa, cebola, pimenta calabresa, requeijão cremoso, mussarela e molho.',
    category: 'Especial',
    prices: { P: 27.99, M: 32.99, G: 37.99, F: 47.99 },
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '8',
    name: 'A Moda da Casa',
    description: 'Frango desfiado, bacon, mussarela, molho de tomate, cebola e orégano.',
    category: 'Especial',
    prices: { P: 27.99, M: 32.99, G: 37.99, F: 47.99 },
    image: 'https://images.unsplash.com/photo-1510739859564-5879df1b994e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '9',
    name: 'Presunto Cremoso',
    description: 'Presunto, bacon, mussarela, catupiry, molho de tomate e cebola.',
    category: 'Especial',
    prices: { P: 27.99, M: 32.99, G: 37.99, F: 47.99 },
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '10',
    name: 'Lombo Canadense',
    description: 'Lombo canadense, molho de tomate, requeijão cremoso, geleia de pimenta e mussarela.',
    category: 'Especial',
    prices: { P: 29.99, M: 34.99, G: 39.99, F: 49.99 },
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&q=80&w=400'
  }
];

export const DRINKS: Drink[] = [
  { id: 'd1', name: 'Refrigerante Lata (350ml)', price: 6.50, category: 'Bebida', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' },
  { id: 'd2', name: 'Refrigerante 1L', price: 10.00, category: 'Bebida', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=400' },
  { id: 'd3', name: 'Refrigerante 2L', price: 14.00, category: 'Bebida', image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&q=80&w=400' },
  { id: 'd4', name: 'Suco Natural (300ml)', price: 8.00, category: 'Bebida', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400' },
];

export const ADDONS: Addon[] = [
  { id: 'a1', name: 'Borda de Catupiry', price: 10 },
  { id: 'a2', name: 'Borda de Chocolate', price: 12 },
  { id: 'a3', name: 'Extra Queijo', price: 8 },
];

export const WHATSAPP_NUMBER = '5598985360660';
