import React, { useState } from 'react';
import { Compra, LoteStock } from '../tipos';
import { PlusCircle, AlertTriangle, Package, Calendar, Euro, Building2, Tag } from 'lucide-react';

interface StockFefoViewProps {
  stock: LoteStock[];
  onAdicionarCompra: (novaCompra: Compra) => void;
}

export const StockFefoView: React.FC<StockFefoViewProps> = ({ stock, onAdicionarCompra }) => {
  const [fornecedor, setFornecedor] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [preco, setPreco] = useState<number | ''>('');
  const [validade, setValidade] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedor || !produto || !quantidade || !preco || !validade) return;

    const novaCompra: Compra = {
      id: Date.now().toString(),
      fornecedor,
      produto,
      quantidade: Number(quantidade),
      preco: Number(preco),
      validade,
      dataCompra: new Date().toISOString().split('T')[0],
    };

    onAdicionarCompra(novaCompra);

    // Limpar formulário
    setFornecedor('');
    setProduto('');
    setQuantidade('');
    setPreco('');
    setValidade('');
  };

  // Ordenação FEFO (Primeiro a Caducar, Primeiro a Sair)
  const stockFEFO = [...stock]
    .filter((lote) => lote.quantidadeRestante > 0)
    .sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());

  // Alerta para produtos que caducam nos próximos 7 dias
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limiteAlertas = new Date();
  limiteAlertas.setDate(hoje.getDate() + 7);

  return (
    <div className="space-y-6">
      {/* 🛒 FORMULÁRIO DE REGISTO DE COMPRA */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-400" />
          Registar Nova Compra (Entrada de Stock)
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Fornecedor */}
          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Fornecedor
            </label>
            <input
              type="text"
              placeholder="Ex: Lactogal"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Produto */}
          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Produto
            </label>
            <input
              type="text"
              placeholder="Ex: Queijo Limiano"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Quantidade (un/kg)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ex: 20"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Preço */}
          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Euro className="w-3.5 h-3.5" /> Preço Total (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 45.50"
              value={preco}
              onChange={(e) => setPreco(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Validade */}
          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Data de Validade
            </label>
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Botão de Submissão */}
          <div className="md:col-span-3 lg:col-span-5 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <PlusCircle className="w-4 h-4" /> Registar Compra e Adicionar ao FEFO
            </button>
          </div>
        </form>
      </div>

      {/* 📦 TABELA DE STOCK INTELIGENTE FEFO */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Gestão de Stock FEFO (Prioridade de Consumo)
            </h3>
            <p className="text-xs text-slate-400">
              Ordenado automaticamente pela data de validade mais próxima.
            </p>
          </div>
        </div>

        {stockFEFO.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Nenhum produto em stock de momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Stock Disponível</th>
                  <th className="p-3">Preço Compra</th>
                  <th className="p-3">Validade</th>
                  <th className="p-3 text-center">Estado FEFO / Alerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stockFEFO.map((lote) => {
                  const dataVal = new Date(lote.validade);
                  const eUrgente = dataVal <= limiteAlertas;

                  return (
                    <tr key={lote.id} className="hover:bg-slate-700/30 transition">
                      <td className="p-3 font-semibold text-white">{lote.produto}</td>
                      <td className="p-3 text-slate-400">{lote.fornecedor}</td>
                      <td className="p-3 font-bold text-emerald-400">{lote.quantidadeRestante} un</td>
                      <td className="p-3 text-slate-300">{lote.preco.toFixed(2)} €</td>
                      <td className="p-3 font-mono text-white">
                        {new Date(lote.validade).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-3 text-center">
                        {eUrgente ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-[11px] font-semibold animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Consumir Prioritariamente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[11px] font-medium">
                            Stock Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
