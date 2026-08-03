import React, { useState } from 'react';
import { StockItem, StockMovement, WasteCategory } from '../types';
import {
  PlusCircle,
  AlertTriangle,
  Package,
  Calendar,
  Euro,
  Building2,
  Tag,
  Truck,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

interface StockFefoViewProps {
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  onAddMovement: (movement: Omit<StockMovement, 'id'>) => void;
  onOpenDonationModalWithItem?: (name: string, category: WasteCategory, quantity: number) => void;
}

export const StockFefoView: React.FC<StockFefoViewProps> = ({
  stockItems = [],
  stockMovements = [],
  onAddMovement,
  onOpenDonationModalWithItem
}) => {
  // Estado para o Formulário de Nova Compra
  const [fornecedor, setFornecedor] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [preco, setPreco] = useState<number | ''>('');
  const [validade, setValidade] = useState('');
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>('todos');

  // Submissão de Compra
  const handleSubmitCompra = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação com alerta para não falhar em silêncio
    if (!fornecedor.trim() || !produto.trim() || !quantidade || !preco || !validade) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    // Regista o movimento de entrada
    onAddMovement({
      stockItemId: `STK-${Date.now()}`,
      itemName: produto,
      type: 'Entrada',
      quantity: Number(quantidade),
      unit: 'kg',
      date: new Date().toISOString().split('T')[0],
      responsible: 'Gestor de Compras',
      supplier: fornecedor.trim(),
      reason: `Compra efetuada ao fornecedor: ${fornecedor.trim()} (${preco}€)`
    });

    // Limpar formulário
    setFornecedor('');
    setProduto('');
    setQuantidade('');
    setPreco('');
    setValidade('');
  };

  // Lista única de fornecedores para o filtro e sugestões
  const listaFornecedores = Array.from(
    new Set(stockItems.map((item) => item.supplier).filter(Boolean))
  ) as string[];

  // Ordenação FEFO (Primeiro a Caducar, Primeiro a Sair) + Filtro de Fornecedor
  const stockOrdenadoFEFO = [...stockItems]
    .filter((item) => (item.quantity ?? 0) > 0)
    .filter((item) =>
      filtroFornecedor === 'todos' ? true : item.supplier?.toLowerCase() === filtroFornecedor.toLowerCase()
    )
    .sort((a, b) => {
      const dataA = new Date(a.expiryDate || '2099-12-31').getTime();
      const dataB = new Date(b.expiryDate || '2099-12-31').getTime();
      return dataA - dataB;
    });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const getDiasParaValidade = (dataStr: string) => {
    if (!dataStr) return 999;
    const dataVal = new Date(dataStr);
    const diffTime = dataVal.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      {/* 🏷️ CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Gestão de Stock FEFO & Compras
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controlo rigoroso de lotes por ordem de validade (First Expired, First Out) e gestão por fornecedor.
          </p>
        </div>

        {/* Filtro por Fornecedor (CORRIGIDO: "Todos os Fornecedores") */}
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">Filtrar por:</span>
          <select
            value={filtroFornecedor}
            onChange={(e) => setFiltroFornecedor(e.target.value)}
            className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos os Fornecedores</option>
            {listaFornecedores.map((forn) => (
              <option key={forn} value={forn}>
                {forn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORMULÁRIO DE COMPRA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          Cadastrar Nova Compra / Entrada de Fornecedor
        </h3>

        <form onSubmit={handleSubmitCompra} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Fornecedor (CORRIGIDO: Etiqueta "Fornecedor *" reposta) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Fornecedor *
            </label>
            <input
              type="text"
              placeholder="Ex: Lactogal / Parmalat"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              list="lista-fornecedores-sugestoes"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <datalist id="lista-fornecedores-sugestoes">
              {listaFornecedores.map((forn, idx) => (
                <option key={idx} value={forn} />
              ))}
            </datalist>
          </div>

          {/* 2. Produto */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Produto *
            </label>
            <input
              type="text"
              placeholder="Ex: Queijo Flamengo"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* 3. Quantidade */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" /> Quantidade (kg/un) *
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Ex: 15"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* 4. Preço */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Euro className="w-3.5 h-3.5 text-slate-400" /> Preço Total (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 48.50"
              value={preco}
              onChange={(e) => setPreco(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* 5. Validade */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data de Validade *
            </label>
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Botão de Submissão */}
          <div className="md:col-span-3 lg:col-span-5 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="w-4 h-4" /> Confirmar Compra e Adicionar ao FEFO
            </button>
          </div>
        </form>
      </div>

      {/* 📦 TABELA STOCK */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          Inventário por Validade (Ordenação FEFO)
        </h3>

        {stockOrdenadoFEFO.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Nenhum artigo em stock para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Stock Atual</th>
                  <th className="p-3">Custo Un.</th>
                  <th className="p-3">Validade</th>
                  <th className="p-3 text-center">Prioridade FEFO</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockOrdenadoFEFO.map((item) => {
                  const diasRestantes = getDiasParaValidade(item.expiryDate);
                  const eUrgente = diasRestantes <= 5;
                  const eAtencao = diasRestantes > 5 && diasRestantes <= 12;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.supplier || 'Fornecedor Geral'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {item.quantity} {item.unit || 'kg'}
                      </td>
                      <td className="p-3 text-slate-600">{(item.costPerUnit ?? 0).toFixed(2)} €</td>
                      <td className="p-3 font-mono font-medium text-slate-700">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-PT') : 'N/D'}
                      </td>
                      <td className="p-3 text-center">
                        {eUrgente ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[11px] font-bold animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Usar Urgente ({diasRestantes}d)
                          </span>
                        ) : eAtencao ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Atenção ({diasRestantes}d)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Normal ({diasRestantes}d)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {onOpenDonationModalWithItem && eUrgente && (
                          <button
                            onClick={() =>
                              onOpenDonationModalWithItem(
                                item.name,
                                (item.category as WasteCategory) || 'Outros',
                                item.quantity
                              )
                            }
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg font-medium text-[11px] transition flex items-center gap-1 ml-auto"
                          >
                            <HeartHandshake className="w-3 h-3" /> Doar Excedente
                          </button>
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
