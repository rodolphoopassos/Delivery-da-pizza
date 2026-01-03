
import React from 'react';
import { Order } from '../types';
import { formatCurrency } from '../utils/helpers';

interface OrderHistoryProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onReorder: (order: Order) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, isOpen, onClose, onReorder }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-md transition-all duration-500 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-lg h-full shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500"
      >
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase text-gray-900">Seu Histórico</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-8 h-1 bg-[#008C45] rounded-full"></span>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Momentos Deliciosos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all active:scale-90"
          >
            <i className="fas fa-times text-gray-400"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 hide-scrollbar bg-[#FAFAFA]">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-50 shadow-sm">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-pizza-slice text-4xl text-[#E31B23] opacity-20"></i>
              </div>
              <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Sem pedidos ainda</p>
              <p className="text-gray-300 text-[10px] font-medium mt-2">Sua primeira pizza inesquecível está a um clique.</p>
              <button 
                onClick={onClose}
                className="mt-8 bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:scale-105 transition-all"
              >
                Escolher Agora
              </button>
            </div>
          ) : (
            orders.map((order, idx) => (
              <div key={idx} className="bg-white border border-gray-50 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-black/5 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black px-2.5 py-1 bg-black text-white rounded-lg uppercase tracking-tighter">
                        PEDIDO #{order.id?.toString().slice(-4) || '---'}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'Novo' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-tighter flex items-center gap-1">
                      <i className="far fa-calendar-alt"></i>
                      {new Date(order.data_pedido || '').toLocaleDateString('pt-BR')} às {new Date(order.data_pedido || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-gray-900 leading-none">{formatCurrency(order.valor_total)}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  {Array.isArray(order.itens_pedido) && order.itens_pedido.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-white border border-gray-200 flex items-center justify-center rounded-lg text-[8px] text-gray-400">{item.qtd}x</span>
                        {item.produto}
                      </span>
                      <span className="text-gray-400 text-[9px] uppercase tracking-tighter max-w-[120px] truncate">{item.sabores}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={() => onReorder(order)}
                    className="flex-1 bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E31B23] transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-red-50"
                  >
                    <i className="fas fa-redo-alt text-[8px]"></i>
                    Pedir Novamente
                  </button>
                  <button className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all">
                    <i className="fas fa-ellipsis-h text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-8 border-t border-gray-50 bg-white">
          <p className="text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">
            Qualidade Chegou Pizza © 2024
          </p>
        </div>
      </div>
    </div>
  );
};
