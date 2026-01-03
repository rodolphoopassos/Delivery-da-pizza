
import React, { useState } from 'react';
import { PizzaFlavor, CartItem, PizzaSize } from '../types';
import { formatCurrency } from '../utils/helpers';
import { X, Check, ShoppingCart } from 'lucide-react';

interface PizzaModalProps {
  initialFlavor: PizzaFlavor | undefined;
  allFlavors: PizzaFlavor[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const PizzaModal: React.FC<PizzaModalProps> = ({ initialFlavor, allFlavors, onClose, onAddToCart }) => {
  if (!initialFlavor) return null;

  const [selectedFlavors, setSelectedFlavors] = useState<PizzaFlavor[]>([initialFlavor]);
  
  const [addons, setAddons] = useState([
    { id: 'b1', name: 'Borda de Catupiry', price: 10.00, selected: false },
    { id: 'b2', name: 'Borda de Chocolate', price: 12.00, selected: false },
    { id: 'b3', name: 'Extra Queijo', price: 8.00, selected: false },
  ]);

  const toggleFlavor = (flavor: PizzaFlavor) => {
    const isSelected = selectedFlavors.find(f => f.id === flavor.id);

    if (isSelected) {
      if (selectedFlavors.length > 1) {
        setSelectedFlavors(prev => prev.filter(f => f.id !== flavor.id));
      }
    } else {
      if (selectedFlavors.length < 2) {
        setSelectedFlavors(prev => [...prev, flavor]);
      } else {
        setSelectedFlavors(prev => [prev[0], flavor]);
      }
    }
  };

  const toggleAddon = (id: string) => {
    setAddons(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  // --- NOVA LÓGICA DE PREÇO (Soma das Metades) ---
  let flavorsPrice = 0;
  const getFlavorBasePrice = (f: PizzaFlavor) => (f as any).price || f.prices?.G || 0;
  
  if (selectedFlavors.length === 1) {
    // Sabor Único: Preço cheio
    flavorsPrice = getFlavorBasePrice(selectedFlavors[0]);
  } else {
    // Meio-a-Meio: Soma a metade de cada um (Média aritmética conforme solicitado)
    const price1 = getFlavorBasePrice(selectedFlavors[0]) / 2;
    const price2 = getFlavorBasePrice(selectedFlavors[1]) / 2;
    flavorsPrice = price1 + price2;
  }

  const addonsPrice = addons.filter(a => a.selected).reduce((acc, curr) => acc + curr.price, 0);
  const finalPrice = flavorsPrice + addonsPrice;

  const modalTitle = selectedFlavors.length === 2 ? "MEIO A MEIO" : selectedFlavors[0].name;
  const modalImage = selectedFlavors[0].image || 'https://via.placeholder.com/400';

  const handleConfirm = () => {
    onAddToCart({
      cartId: Math.random().toString(36).substr(2, 9),
      type: 'pizza',
      size: 'G' as PizzaSize,
      flavors: selectedFlavors,
      addons: addons.filter(a => a.selected).map(a => ({ id: a.id, name: a.name, price: a.price })),
      quantity: 1,
      unitPrice: finalPrice,
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]">
        
        {/* Header com Imagem */}
        <div className="h-48 relative shrink-0">
             <img src={modalImage} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
             
             <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <X className="w-5 h-5" />
             </button>

             <div className="absolute bottom-0 left-0 w-full p-8 text-center pb-10">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-md">
                  {modalTitle}
                </h2>
                <p className="text-xs font-bold text-white/80 mt-1 uppercase tracking-widest">
                  {selectedFlavors.length === 2 ? 'Combinação Premium' : 'Sabor Tradicional'}
                </p>
             </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white custom-scrollbar">
            
            {/* Lista de Sabores */}
            <div>
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Monte sua combinação (até 2)</h3>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedFlavors.length === 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    {selectedFlavors.length}/2 Selecionados
                 </span>
               </div>
               
               <div className="grid grid-cols-1 gap-3">
                  {allFlavors.filter(f => !f.category.toUpperCase().includes('BEBIDA')).map(flavor => {
                    const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                    const flavorDisplayPrice = getFlavorBasePrice(flavor);
                    return (
                      <div 
                        key={flavor.id} 
                        onClick={() => toggleFlavor(flavor)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                           isSelected 
                           ? 'border-[#E31B23] bg-white shadow-lg shadow-red-50' 
                           : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div>
                                <p className={`font-black uppercase text-sm ${isSelected ? 'text-[#E31B23]' : 'text-gray-700'}`}>{flavor.name}</p>
                                <p className="text-gray-400 font-bold text-xs mt-0.5">{formatCurrency(flavorDisplayPrice)}</p>
                            </div>
                         </div>
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                            isSelected ? 'bg-[#E31B23] border-[#E31B23] text-white' : 'border-gray-300 bg-white'
                         }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Adicionais */}
            <div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Extras & Bordas</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addons.map(addon => (
                     <div 
                       key={addon.id}
                       onClick={() => toggleAddon(addon.id)}
                       className={`p-4 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                          addon.selected ? 'border-black bg-black text-white shadow-xl' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                       }`}
                     >
                        <div>
                           <p className="font-bold text-sm uppercase">{addon.name}</p>
                           <p className={`text-xs font-bold mt-0.5 ${addon.selected ? 'text-gray-400' : 'text-green-600'}`}>+ {formatCurrency(addon.price)}</p>
                        </div>
                        {addon.selected && <Check className="w-4 h-4" />}
                     </div>
                  ))}
               </div>
            </div>
        </div>

        {/* Footer com Preço */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0">
           <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total do Item</span>
                 <span className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(finalPrice)}</span>
              </div>
              
              {/* Resumo visual do cálculo da média de metades */}
              {selectedFlavors.length === 2 && (
                 <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                       METADE 1: {formatCurrency(getFlavorBasePrice(selectedFlavors[0]) / 2)}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                       METADE 2: {formatCurrency(getFlavorBasePrice(selectedFlavors[1]) / 2)}
                    </p>
                 </div>
              )}
           </div>
           <button 
             onClick={handleConfirm}
             className="w-full bg-[#E31B23] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2"
           >
             <ShoppingCart className="w-4 h-4" /> Adicionar ao Pedido
           </button>
        </div>

      </div>
    </div>
  );
};
