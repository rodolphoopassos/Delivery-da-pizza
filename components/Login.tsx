
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onLogin({ name, phone });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[100px] opacity-50"></div>

      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.08)] overflow-hidden p-10 relative z-10 border border-gray-50">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-2 mb-6">
            <span className="text-3xl font-black tracking-tighter">CHEGOU</span>
            <div className="flex flex-col gap-[3px]">
              <div className="w-6 h-1.5 bg-[#008C45]"></div>
              <div className="w-6 h-1.5 bg-black"></div>
              <div className="w-6 h-1.5 bg-[#E31B23]"></div>
            </div>
            <span className="text-3xl font-black tracking-tighter">PIZZA</span>
          </div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Bem-vindo à Melhor</h2>
          <p className="text-gray-500 font-medium">Faça seu pedido em menos de 1 minuto.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Como devemos te chamar?</label>
            <input
              type="text"
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-black outline-none transition-all font-bold text-gray-800"
              placeholder="Seu Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu WhatsApp</label>
            <input
              type="tel"
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-black outline-none transition-all font-bold text-gray-800"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-900 text-white font-black py-5 rounded-2xl shadow-2xl shadow-gray-200 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
          >
            Explorar Cardápio <i className="fas fa-chevron-right ml-2 text-[8px]"></i>
          </button>
        </form>
        
        <p className="text-center mt-10 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          Sabor • Tradição • Velocidade
        </p>
      </div>
    </div>
  );
};
