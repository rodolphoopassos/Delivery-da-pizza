
import React, { useState, useEffect } from 'react';
import { User, CartItem, PizzaFlavor, Order, Drink } from './types';
import { Login } from './components/Login';
import { PizzaModal } from './components/PizzaModal';
import { AISuggestor } from './components/AISuggestor';
import { OrderHistory } from './components/OrderHistory';
import { formatCurrency, formatOrderForWhatsApp } from './utils/helpers';
import { supabase } from './supabaseClient';
import { Store, Clock, MapPin, X, ShoppingBag, Plus, Trash2, QrCode, CreditCard, Banknote, Navigation, Loader2 } from 'lucide-react';

// --- CHAVE DA API DO GOOGLE MAPS ---
const GOOGLE_MAPS_API_KEY = "AIzaSyAB7Tjp16un2ttHb5eqSQYLTcPgaRs5T6w"; 

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState(false);
  const [activePizza, setActivePizza] = useState<PizzaFlavor | undefined>();
  
  const [activeTab, setActiveTab] = useState<string>(''); 
  const [categories, setCategories] = useState<string[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Cartão - Maquininha');
  const [locating, setLocating] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [pizzas, setPizzas] = useState<PizzaFlavor[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  // --- ESTADOS PARA CONFIGURAÇÕES DA LOJA ---
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchStoreSettings();
      await fetchMenu();
      const saved = localStorage.getItem('pizza_user');
      if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        fetchHistory(u.phone);
      }
    };
    init();

    const channel = supabase
      .channel('app-realtime-final')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cardapio' }, () => fetchMenu())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes_loja' }, () => fetchStoreSettings())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Lógica para Calcular a Taxa de Entrega baseada no Endereço
  useEffect(() => {
     if (storeSettings?.zonas_entrega && address.length > 5) {
        calculateDeliveryFee();
     }
  }, [address, storeSettings]);

  const fetchStoreSettings = async () => {
     try {
        const { data } = await supabase.from('configuracoes_loja').select('*').limit(1).single();
        if (data) {
           setStoreSettings(data);
           checkIfOpen(data.horarios);
        }
     } catch (err) { console.error("Erro loja:", err); }
  };

  const checkIfOpen = (horarios: any[]) => {
      if (!horarios || !Array.isArray(horarios)) return;
      const now = new Date();
      const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const hoje = diasSemana[now.getDay()];
      const regraHoje = horarios.find((h: any) => h.day === hoje);
      
      if (!regraHoje || regraHoje.closed) {
          setIsStoreOpen(false);
          return;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [openH, openM] = regraHoje.open.split(':').map(Number);
      const [closeH, closeM] = regraHoje.close.split(':').map(Number);
      
      const openMinutes = openH * 60 + openM;
      let closeMinutes = closeH * 60 + closeM;
      if (closeMinutes < openMinutes) closeMinutes += 24 * 60;

      let adjustedCurrent = currentMinutes;
      if (currentMinutes < openMinutes && currentMinutes < (closeMinutes - 24*60)) {
         adjustedCurrent += 24 * 60;
      }
      setIsStoreOpen(adjustedCurrent >= openMinutes && adjustedCurrent < closeMinutes);
  };

  const calculateDeliveryFee = () => {
      if (!storeSettings?.zonas_entrega) return;
      const zonaEncontrada = storeSettings.zonas_entrega.find((zona: any) => 
          address.toLowerCase().includes(zona.name.toLowerCase())
      );
      setDeliveryFee(zonaEncontrada ? zonaEncontrada.price : 0);
  };

  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      const { data, error } = await supabase.from('cardapio').select('*');
      if (error) throw error;
      if (data) {
        const normalizedData = data.map((item: any) => {
          const valorExato = Number(item.price || item.preco || 0);
          return {
            ...item,
            name: item.name || item.nome || 'Sem Nome',
            image: item.imagem_url || item.image_url || item.image || item.imagem || 'https://via.placeholder.com/150',
            description: item.description || item.descricao || '',
            category: (item.category || item.categoria || 'Outros').trim(),
            price: valorExato,
            prices: { P: valorExato, M: valorExato, G: valorExato, F: valorExato }
          };
        });

        const uniqueCategories = Array.from(new Set(normalizedData.map((i: any) => i.category)));
        const sortedCategories = uniqueCategories.sort((a: any, b: any) => {
           const upperA = a.toUpperCase(); const upperB = b.toUpperCase();
           if (upperA.includes('PIZZA') || upperA.includes('TRADICIONAL')) return -1;
           if (upperB.includes('PIZZA') || upperB.includes('TRADICIONAL')) return 1;
           return a.localeCompare(b);
        });
        setCategories(sortedCategories);
        if (!activeTab && sortedCategories.length > 0) setActiveTab(sortedCategories[0]);
        setPizzas(normalizedData.filter((item: any) => !item.category.toUpperCase().includes('BEBIDA')));
        setDrinks(normalizedData.filter((item: any) => item.category.toUpperCase().includes('BEBIDA')));
      }
    } catch (err) { console.error("Erro menu:", err); } finally { setLoadingMenu(false); }
  };

  const fetchHistory = async (phone: string) => {
    try {
      const { data } = await supabase.from('pedidos').select('*').eq('cliente_telefone', phone).order('data_pedido', { ascending: false }).limit(5);
      if (data) setOrderHistory(data);
    } catch (err) {}
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) { alert("Navegador sem suporte."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`);
          const data = await response.json();
          if (data.status === "OK" && data.results[0]) {
            setAddress(data.results[0].formatted_address);
          } else {
            setAddress(`Minha Localização (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
          }
        } catch (error) { alert("Erro ao conectar com Google Maps."); } finally { setLocating(false); }
      }, () => { alert("Precisamos de permissão para localizar."); setLocating(false); }
    );
  };

  const handleLogin = async (u: User) => {
    setUser(u);
    localStorage.setItem('pizza_user', JSON.stringify(u));
    fetchHistory(u.phone);
    try { await supabase.from('profiles').upsert({ phone: u.phone, name: u.name }); } catch (err) {}
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.cartId !== id));

  const subTotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const cartTotal = subTotal + deliveryFee;

  const handleFinishOrder = async () => {
    if (!user || !address) { alert("Informe o endereço!"); return; }
    if (!isStoreOpen) { alert("A loja está fechada!"); return; }
    if (storeSettings?.pedido_minimo && subTotal < storeSettings.pedido_minimo) {
        alert(`Pedido mínimo: ${formatCurrency(storeSettings.pedido_minimo)}`);
        return;
    }

    setIsFinishing(true);
    try {
      const itensFormatados = cart.map(item => ({
        produto: item.type === 'pizza' ? `Pizza ${item.size}` : item.flavors[0].name,
        sabores: item.flavors.map(f => f.name).join(', '),
        descricao_completa: item.flavors.map(f => f.description ? `${f.name}: ${f.description}` : f.name).join(' | '),
        adicionais: item.addons ? item.addons.map(a => a.name).join(', ') : '',
        qtd: item.quantity,
        preco_unitario: item.unitPrice
      }));

      await supabase.from('pedidos').insert([{
        cliente_nome: user.name, 
        cliente_telefone: user.phone, 
        endereco_entrega: address,
        forma_pagamento: payment, 
        valor_total: cartTotal, 
        taxa_entrega: deliveryFee,
        itens_pedido: itensFormatados, 
        status: 'Novo', 
        data_pedido: new Date().toISOString()
      }]);

      const whatsappUrl = formatOrderForWhatsApp(user, cart, cartTotal, address, payment);
      setTimeout(() => {
        setCart([]);
        setIsCartOpen(false);
        setIsFinishing(false);
        window.open(whatsappUrl, '_blank');
        fetchHistory(user.phone);
      }, 1500);
    } catch (error) {
      setIsFinishing(false);
      alert("Erro ao salvar pedido. Abrindo WhatsApp...");
      window.open(formatOrderForWhatsApp(user, cart, cartTotal, address, payment), '_blank');
    }
  };

  const handleReorder = (order: Order) => {
     setIsHistoryOpen(false);
     setIsCartOpen(true);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 text-slate-900 font-sans selection:bg-red-100 selection:text-[#E31B23]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => setIsHistoryOpen(true)} className="flex flex-col group text-left">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-xl font-black tracking-tighter">CHEGOU</span>
              <div className="flex flex-col gap-[2px] mx-1">
                <div className="w-4 h-1 bg-[#008C45] rounded-full"></div>
                <div className="w-4 h-1 bg-black rounded-full"></div>
                <div className="w-4 h-1 bg-[#E31B23] rounded-full"></div>
              </div>
              <span className="text-xl font-black tracking-tighter">PIZZA</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
               <div className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Olá, {user.name.split(' ')[0]} • {isStoreOpen ? 'Aberto' : 'Fechado'}
               </p>
            </div>
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="group relative p-4 bg-black text-white rounded-[1.5rem] shadow-2xl hover:scale-105 transition-all active:scale-90">
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg shadow-red-200">{cart.length}</span>}
          </button>
        </div>
      </header>

      <div className="bg-white/40 backdrop-blur-sm sticky top-[82px] z-30 border-b border-gray-100 overflow-x-auto hide-scrollbar">
        <div className="max-w-5xl mx-auto flex p-4 space-x-3">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 ${activeTab === cat ? 'bg-black text-white shadow-xl scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <h2 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tight mb-12"><span className="w-2 h-10 bg-[#E31B23] rounded-full"></span>{activeTab}</h2>

        {loadingMenu ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1,2,3,4].map(i => <div key={i} className="h-44 bg-gray-100 rounded-[3rem] animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {!activeTab.toUpperCase().includes('BEBIDA') ? (
              pizzas.filter(f => f.category === activeTab).map(pizza => (
                <div key={pizza.id} onClick={() => { setActivePizza(pizza); setIsPizzaModalOpen(true); }} className="group bg-white p-6 rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 flex gap-8 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative overflow-hidden rounded-[2.5rem] w-36 h-36 flex-shrink-0 shadow-lg shadow-gray-100">
                    <img src={pizza.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={pizza.name} />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <h3 className="font-black text-xl text-gray-900 leading-tight uppercase tracking-tighter">{pizza.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-black uppercase leading-relaxed line-clamp-2 tracking-tight">{pizza.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-[#008C45] font-black text-2xl tracking-tighter">{formatCurrency(pizza.price)}</p>
                      <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all"><Plus className="w-4 h-4" /></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              drinks.map(drink => (
                <div key={drink.id} onClick={() => addToCart({ cartId: Math.random().toString(), type: 'drink', flavors: [{ name: drink.name, image: drink.image } as any], addons: [], quantity: 1, unitPrice: drink.price, notes: '' })} className="group bg-white p-6 rounded-[2.5rem] border border-gray-50 flex gap-6 items-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-24 h-24 rounded-[2rem] bg-gray-50 p-2 overflow-hidden shadow-inner">
                    <img src={drink.image} className="w-full h-full object-contain mix-blend-multiply" alt={drink.name} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">{drink.name}</h3>
                    <p className="text-[#E31B23] font-black text-xl mt-1 tracking-tighter">{formatCurrency(drink.price)}</p>
                  </div>
                  <div className="w-12 h-12 bg-black text-white rounded-[1.5rem] flex items-center justify-center shadow-lg group-active:scale-90 transition-all"><Plus className="w-4 h-4" /></div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      
      <AISuggestor cart={cart} onAddProduct={addToCart} allPizzas={pizzas} allDrinks={drinks} />
      <OrderHistory orders={orderHistory} isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onReorder={handleReorder} />

      {isPizzaModalOpen && <PizzaModal initialFlavor={activePizza} allFlavors={pizzas} onClose={() => setIsPizzaModalOpen(false)} onAddToCart={addToCart} />}
      
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
             <div className="p-10 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight uppercase text-gray-900">Checkout</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Balcão Ágil • {isStoreOpen ? 'Aberto' : '🔴 Loja Fechada'}</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-14 h-14 bg-gray-50 rounded-[1.5rem] flex items-center justify-center hover:bg-gray-100 transition-all"><X className="w-6 h-6 text-gray-400" /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-8 hide-scrollbar">
               {cart.length === 0 ? (
                 <div className="text-center py-24 opacity-30"><ShoppingBag className="w-16 h-16 mx-auto mb-6 text-gray-200" /><p className="font-black uppercase text-xs tracking-widest text-gray-400">Seu carrinho está aguardando</p></div>
               ) : (
                 <div className="space-y-6">
                   {cart.map(item => (
                     <div key={item.cartId} className="flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                         <img src={item.flavors[0]?.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Produto" />
                       </div>
                       <div className="flex-1">
                         <p className="font-black text-sm uppercase text-gray-900 leading-none">{item.type === 'pizza' ? `Pizza ${item.size}` : item.flavors[0].name}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 line-clamp-1 tracking-tight">{item.flavors.map(f => f.name).join(' / ')}</p>
                         <p className="text-black font-black text-base mt-3 tracking-tighter">{formatCurrency(item.unitPrice * item.quantity)}</p>
                       </div>
                       <button onClick={() => removeFromCart(item.cartId)} className="w-10 h-10 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   ))}
                 </div>
               )}

               {cart.length > 0 && (
                 <div className="space-y-10 pt-10 border-t border-gray-50">
                   <div className="space-y-4">
                     <div className="flex justify-between items-center px-1">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Entrega</h3>
                       <button onClick={detectLocation} disabled={locating} className={`text-[10px] font-black uppercase text-[#008C45] flex items-center gap-2 hover:underline transition-all ${locating ? 'opacity-50' : ''}`}>{locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}{locating ? 'Detectando...' : 'Localização Automática'}</button>
                     </div>
                     <textarea className="w-full p-6 rounded-[2rem] border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-black outline-none transition-all text-xs font-bold leading-relaxed shadow-inner" placeholder="Rua, Número, Bairro, Ponto de Referência..." value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
                     {address.length > 5 && <p className={`text-[10px] font-bold uppercase px-1 ${deliveryFee > 0 ? 'text-blue-600' : 'text-green-600'}`}>{deliveryFee > 0 ? `Taxa de entrega: ${formatCurrency(deliveryFee)}` : 'Entrega Grátis ou a combinar'}</p>}
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 px-1">Pagamento</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <button onClick={() => setPayment('Cartão - Maquininha')} className={`p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${payment === 'Cartão - Maquininha' ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'}`}><CreditCard className="w-4 h-4" />Cartão</button>
                       <button onClick={() => setPayment('Pix')} className={`p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${payment === 'Pix' ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'}`}><QrCode className="w-4 h-4" />Pix</button>
                       <button onClick={() => setPayment('Dinheiro')} className={`p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${payment === 'Dinheiro' ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'}`}><Banknote className="w-4 h-4" />Dinheiro</button>
                     </div>
                   </div>
                 </div>
               )}
             </div>

             {cart.length > 0 && (
               <div className="p-10 border-t border-gray-50 bg-white">
                 <div className="space-y-1 mb-8">
                    <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest"><span>Subtotal</span><span>{formatCurrency(subTotal)}</span></div>
                    <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest"><span>Entrega</span><span className={deliveryFee === 0 ? 'text-green-500' : ''}>{deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span></div>
                    <div className="flex justify-between items-end pt-4">
                      <div><p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Total Final</p><p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(cartTotal)}</p></div>
                      <div className="flex flex-col items-end"><span className="text-[9px] text-green-600 font-black uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100 mb-1">Cozinha Agilizada</span><p className="text-[9px] text-gray-300 font-medium">Tempo: 35-45 min</p></div>
                    </div>
                 </div>
                 <button onClick={handleFinishOrder} disabled={isFinishing || !address || !isStoreOpen} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isFinishing || !isStoreOpen ? 'bg-black text-white' : 'bg-[#E31B23] hover:bg-red-700 text-white shadow-red-100'} disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-300`}>
                   {!isStoreOpen ? (
                     <><X className="w-4 h-4" /> LOJA FECHADA AGORA</>
                   ) : isFinishing ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> ENVIANDO...</>
                   ) : (
                     <><i className="fab fa-whatsapp text-lg"></i> Finalizar no WhatsApp</>
                   )}
                 </button>
                 {storeSettings?.pedido_minimo > 0 && subTotal < storeSettings.pedido_minimo && (
                   <p className="text-[10px] text-red-500 font-black text-center mt-3 uppercase tracking-widest">Pedido Mínimo: {formatCurrency(storeSettings.pedido_minimo)}</p>
                 )}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
