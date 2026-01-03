
import { PizzaFlavor, PizzaSize, Addon, CartItem, User, AIRecommendation } from '../types';
import { WHATSAPP_NUMBER } from '../constants';
import { GoogleGenAI } from "@google/genai";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const calculatePizzaPrice = (flavors: PizzaFlavor[], size: PizzaSize, addons: Addon[]): number => {
  if (flavors.length === 0) return 0;
  
  // Obtém os preços de cada sabor para o tamanho selecionado
  const flavorPrices = flavors.map(f => f.prices?.[size] || 0);
  
  // REGRA SOLICITADA: Soma da metade de cada sabor (Média Aritmética)
  // Ex: (Sabor1 + Sabor2) / 2  OU  (Sabor1 / 2) + (Sabor2 / 2)
  const basePrice = flavorPrices.reduce((acc, curr) => acc + curr, 0) / flavorPrices.length;
  
  const addonsPrice = addons.reduce((acc, curr) => acc + curr.price, 0);
  
  return basePrice + addonsPrice;
};

export const formatOrderForWhatsApp = (user: User, items: CartItem[], total: number, address: string, payment: string) => {
  let message = `*🍕 NOVO PEDIDO - CHEGOU PIZZA*\n\n`;
  message += `*Cliente:* ${user.name}\n`;
  message += `*Telefone:* ${user.phone}\n\n`;
  message += `*Itens:*\n`;

  items.forEach((item, index) => {
    if (item.type === 'pizza') {
      const flavorNames = item.flavors.map(f => f.name).join(' / ');
      message += `${index + 1}. Pizza ${item.size} - ${flavorNames}\n`;
      if (item.addons.length > 0) {
        message += `   + ${item.addons.map(a => a.name).join(', ')}\n`;
      }
    } else {
      message += `${index + 1}. ${item.flavors[0].name} (${item.quantity}x)\n`;
    }
    if (item.notes) message += `   _Obs: ${item.notes}_\n`;
    message += `   Preço: ${formatCurrency(item.unitPrice * item.quantity)}\n\n`;
  });

  message += `*Total:* ${formatCurrency(total)}\n`;
  message += `*Endereço:* ${address}\n`;
  message += `*Pagamento:* ${payment}\n\n`;
  message += `_Enviado via App Chegou Pizza_`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
};

export const getAIRecommendation = async (cart: CartItem[], allPizzas: PizzaFlavor[], allDrinks: any[]): Promise<AIRecommendation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const cartDesc = cart.map(item => {
    const names = item.flavors.map(f => f.name).join(' / ');
    return `${item.quantity}x ${item.type === 'pizza' ? 'Pizza' : ''} ${names}`;
  }).join(', ');

  const menuPizzas = allPizzas.filter(p => (p.category || p.categoria) === 'Doce').map(p => `ID:${p.id} Name:${p.name}`).join(' | ');
  const menuDrinks = allDrinks.map(d => `ID:${d.id} Name:${d.name}`).join(' | ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Carrinho: [${cartDesc}]. Sugira um item (Doce ou Bebida) do menu: [Pizzas Doces: ${menuPizzas}] ou [Bebidas: ${menuDrinks}].
      Responda EXCLUSIVAMENTE em formato JSON: {"text": "Sua frase curta persuasiva", "productId": "ID_DO_PRODUTO"}.`,
      config: {
        systemInstruction: "Você é um sommelier de pizzas. Sua meta é o upselling. Sugira algo que o cliente ainda não tem. Seja breve (15 palavras max).",
        temperature: 0.6,
        responseMimeType: "application/json"
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return {
      text: result.text || "Que tal uma bebida para acompanhar?",
      productId: result.productId
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { text: "Nossas bebidas combinam perfeitamente com sua escolha!" };
  }
};
