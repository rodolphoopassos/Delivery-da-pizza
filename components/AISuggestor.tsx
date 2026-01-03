import React, { useState, useEffect } from 'react';
import { CartItem, PizzaFlavor, AIRecommendation, Drink } from '../types';
import { getAIRecommendation, formatCurrency } from '../utils/helpers';

interface AISuggestorProps {
  cart: CartItem[];
  onAddProduct: (item: CartItem) => void;
  allPizzas: PizzaFlavor[];
  allDrinks: Drink[];
}

export const AISuggestor: React.FC<AISuggestorProps> = ({ cart, onAddProduct, allPizzas, allDrinks }) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cart.length > 0 && !recommendation) {
      handleGetSuggestion();
    }
    if (cart.length === 0) {
      setRecommendation(null);
      setVisible(false);
    }
  }, [cart]);

  const handleGetSuggestion = async () => {
    setLoading(true);
    const result = await getAIRecommendation(cart, allPizzas, allDrinks);
    setRecommendation(result);
    setLoading(false);
    setVisible(true);
  };

  const handleQuickAdd = () => {
    if (!recommendation?.productId) return;
    
    const drink = allDrinks.find(d => d.id === recommendation.productId);
    if (drink) {
      onAddProduct({
        cartId: Math.random().toString(36).substr(2, 9),
        type: 'drink',
        flavors: [{ name: drink.name } as any],
        addons: [],
        notes: 'Adicionado via Sugestão IA',
        quantity: 1,
        unitPrice: drink.price
      });
      setVisible(false);
      return;
    }

    const pizza = allPizzas.find(p => p.id === recommendation.productId);
    if (pizza) {
      onAddProduct({
        cartId: Math.random().toString(36).substr(2, 9),
        type: 'pizza',
        flavors: [pizza],
        size: 'G',
        addons: [],
        notes: 'Adicionado via Sugestão IA',
        quantity: 1,
        unitPrice: pizza.prices?.G || 0
      });
      setVisible(false);
    }
  };

  if (cart.length === 0 || !visible) return null;

  return (
    <div className="fixed bottom-32 right-6 z-40 max-w-[300px] animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-white relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#008C45] via-black to-[#E31B23]"></div>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg">
            <i className="fas fa-wand-magic-sparkles text-white text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#E31B23] mb-1">Dica Gourmet</p>
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse"></div>
                <div className="h-3 w-2/3 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-gray-800 leading-relaxed italic pr-4">
                  "{recommendation?.text}"
                </p>
                {recommendation?.productId && (
                  <button 
                    onClick={handleQuickAdd}
                    className="mt-4 w-full bg-gray-900 text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all transform active:scale-95 flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Adicionar ao Pedido</span>
                    <i className="fas fa-plus text-[8px] group-hover/btn:rotate-90 transition-transform"></i>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors p-1"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  );
};
