import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Barcode, 
  PackagePlus, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  FileCode
} from 'lucide-react';

interface Props {
  empresaId?: string;
}

export const EntradaMercadoriaView: React.FC<Props> = ({ empresaId }) => {
  const [mode, setMode] = useState<'manual' | 'import'>('import');
  
  // Estado para Entrada Manual
  const [manualForm, setManualForm] = useState({
    nomeProduto: '',
    categoria: 'Hortofrutícolas',
    quantidade: '',
    unidade: 'kg',
    lote: '',
    validade: '',
    precoCusto: ''
  });

  // Estado para Upload de Fatura / Ficheiro
  const [isDragging, setIsDragging] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedItems, setImportedItems] = useState<any[]>([]);

  // Simulação do Processamento Inteligente de Fatura (IA / OCR)
  const handleFileUpload = (file: File) => {
    setFileUploaded(file);
    setIsProcessing(true);

    // Simula extração automática de dados do PDF/XML/SAF-T
    setTimeout(() => {
      setIsProcessing(false);
      setImportedItems([
        { id: 1, nome: 'Tomate de Rama Fresco', cat: 'Hortofrutícolas', qtd: 45, un: 'kg', lote: 'LT-2026-081', validade: '2026-08-15', preco: 1.45 },
        { id: 2, nome: 'Queijo Mozzarella 1kg', cat: 'Lacticínios', qtd: 20, un: 'un', lote: 'LT-88219', validade: '2026-09-02', preco: 6.80 },
        { id: 3, nome: 'Azeite Virgem Extra 5L', cat: 'Mercearia', qtd: 10, un: 'un', lote: 'AZ-4412', validade: '2027-02-10', preco: 34.50 },
        { id: 4, nome: 'Peito de Frango KG', cat: 'Talho', qtd: 30, un: 'kg', lote: 'PF-9901', validade: '2026-08-10', preco: 5.20 },
      ]);
    }, 1800);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PackagePlus className="w-7 h-7 text-emerald-500" />
            Entrada de Mercadoria & Faturas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gira a entrada de stocks para pequenos volumes manuais ou importações massivas automáticas.
          </p>
        </div>

        {/* Alternador de Modalidade */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('import')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'import'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Importação Inteligente (Grandes Espaços)
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'manual'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Entrada Manual / Rápida
          </button>
        </div>
      </div>

      {/* 🚀 MODALIDADE 1: IMPORTAÇÃO EM MASSA (PDF / SAF-T / XML / IA) */}
      {mode === 'import' && (
        <div className="space-y-6">
          {/* Zona de Upload / Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-500/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.xml,.saft"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                Arrasta a Fatura ou Clica para Carregar
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-4">
                Suporta faturas em **PDF** (Leitura IA/OCR), ficheiros **SAF-T (PT)** e **XML** de fornecedores (Makro, Recheio, etc.).
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> PDF Fatura
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <FileCode className="w-3.5 h-3.5 text-emerald-500" /> SAF-T / XML
                </span>
              </div>
            </label>
          </div>

          {/* Feedback de Processamento */}
          {isProcessing && (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-4 animate-pulse">
              <Sparkles className="w-6 h-6 text-emerald-600 animate-spin" />
              <div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">A processar documento com IA...</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">A extrair produtos, lotes, quantidades e datas de validade da fatura.</p>
              </div>
            </div>
          )}

          {/* Pré-visualização dos Itens Extraídos da Fatura */}
          {importedItems.length > 0 && !isProcessing && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {importedItems.length} Produtos Encontrados na Fatura
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Revê os dados antes de dar entrada definitiva no inventário.</p>
                </div>
                <button 
                  onClick={() => {
                    alert('Entrada em massa efetuada com sucesso!');
                    setImportedItems([]);
                    setFileUploaded(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Confirmar & Dar Entrada em Massa
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-semibold uppercase text-xs">
                    <tr>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Quantidade</th>
                      <th className="p-3">Lote</th>
                      <th className="p-3">Validade</th>
                      <th className="p-3">Preço Custo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-medium text-slate-800 dark:text-white">{item.nome}</td>
                        <td className="p-3">{item.cat}</td>
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{item.qtd} {item.un}</td>
                        <td className="p-3 font-mono text-xs">{item.lote}</td>
                        <td className="p-3 font-mono text-xs text-amber-600 dark:text-amber-400">{item.validade}</td>
                        <td className="p-3 font-mono">{item.preco.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📝 MODALIDADE 2: ENTRADA MANUAL / RÁPIDA (ESPAÇOS PEQUENOS) */}
      {mode === 'manual' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Formulário de Entrada Rápida</h3>
              <p className="text-xs text-slate-500">Ideal para adicionar produtos individualmente ou usar leitor de código de barras.</p>
            </div>
            <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <Barcode className="w-4 h-4 text-emerald-500" /> Usar Leitor de Código de Barras
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            alert('Produto adicionado ao stock com sucesso!');
          }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Produto *</label>
              <input
                type="text"
                required
                placeholder="Ex: Azeite Virgem Extra 75cl"
                value={manualForm.nomeProduto}
                onChange={(e) => setManualForm({ ...manualForm, nomeProduto: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
              <select
                value={manualForm.categoria}
                onChange={(e) => setManualForm({ ...manualForm, categoria: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Hortofrutícolas">Hortofrutícolas</option>
                <option value="Lacticínios">Lacticínios</option>
                <option value="Carnes/Peixes">Carnes & Peixes</option>
                <option value="Mercearia">Mercearia</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Congelados">Congelados</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Quantidade *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="Ex: 10"
                  value={manualForm.quantidade}
                  onChange={(e) => setManualForm({ ...manualForm, quantidade: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <select
                  value={manualForm.unidade}
                  onChange={(e) => setManualForm({ ...manualForm, unidade: e.target.value })}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="un">un</option>
                  <option value="L">L</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Validade (FEFO) *</label>
              <input
                type="date"
                required
                value={manualForm.validade}
                onChange={(e) => setManualForm({ ...manualForm, validade: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Número de Lote (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: LT-99201"
                value={manualForm.lote}
                onChange={(e) => setManualForm({ ...manualForm, lote: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar ao Inventário
              </button>
            </div>
          </form>
          )}
        </div>
      );
      };

export default EntradaMercadoriaView;
