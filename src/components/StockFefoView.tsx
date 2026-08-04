import React, { useEffect, useState } from 'react';
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

/**
 * Nota:
 * - Acrescentei suporte a uma lista local de fornecedores (com entradas dos Açores / Ilha Terceira).
 * - Permito adicionar novos fornecedores (estado local + callback onAddSupplier opcional para persistência).
 * - Acrescentei um uploader de faturas que usa OCR via Tesseract.js (client-side). Para PDFs uso pdfjs-dist para renderizar a primeira página.
 *
 * Requisitos para OCR (instalar na app):
 *   npm i tesseract.js pdfjs-dist
 *
 * Alternativa recomendada em produção: enviar faturas ao servidor e processar lá (mais robusto, menos esforço no browser).
 */

interface Supplier {
  id: string;
  name: string;
  region?: string; // ex: "Açores"
  island?: string; // ex: "Terceira"
  contact?: string;
}

interface StockFefoViewProps {
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  onAddMovement: (movement: Omit<StockMovement, 'id'>) => void;
  onOpenDonationModalWithItem?: (name: string, category: WasteCategory, quantity: number) => void;
  // Novo optional callback para persistir/guardar fornecedor
  onAddSupplier?: (supplier: Supplier) => void;
  // Optional suppliers prop (se preferires controlar a lista externamente)
  suppliers?: Supplier[];
}

export const StockFefoView: React.FC<StockFefoViewProps> = ({
  stockItems = [],
  stockMovements = [],
  onAddMovement,
  onOpenDonationModalWithItem,
  onAddSupplier,
  suppliers: suppliersProp
}) => {
  // Estado para o Formulário de Nova Compra
  const [fornecedor, setFornecedor] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [preco, setPreco] = useState<number | ''>('');
  const [validade, setValidade] = useState('');
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>('todos');

  // Estado local de fornecedores (inicial com alguns da Ilha Terceira / Açores)
  const initialAzoresSuppliers: Supplier[] = [
    { id: 'sup-az-01', name: 'Laticínios Terceira Lda', region: 'Açores', island: 'Terceira', contact: 'contact@laticiniosterceira.pt' },
    { id: 'sup-az-02', name: 'Ilha Fresh - Terceira', region: 'Açores', island: 'Terceira', contact: 'vendas@ilhafresh.pt' },
    { id: 'sup-az-03', name: 'Mar do Pico Distribuições', region: 'Açores', island: 'Pico', contact: 'info@mardopico.pt' } // exemplo (não Terceira)
  ];

  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>(() => suppliersProp ?? initialAzoresSuppliers);

  // Se fornecedores forem passados por prop, sincroniza (único sentido para bootstrap)
  useEffect(() => {
    if (suppliersProp && suppliersProp.length > 0) {
      setLocalSuppliers(suppliersProp);
    }
  }, [suppliersProp]);

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

  // Permite ao utilizador adicionar um novo fornecedor UI-localmente
  const [novoFornecedorNome, setNovoFornecedorNome] = useState('');
  const [novoFornecedorIsland, setNovoFornecedorIsland] = useState('Terceira');
  const [novoFornecedorRegion, setNovoFornecedorRegion] = useState('Açores');

  const handleAddSupplier = () => {
    const name = novoFornecedorNome.trim();
    if (!name) {
      alert('Nome do fornecedor obrigatório.');
      return;
    }
    const novo: Supplier = {
      id: `sup-${Date.now()}`,
      name,
      region: novoFornecedorRegion,
      island: novoFornecedorIsland
    };
    setLocalSuppliers((s) => [novo, ...s]);
    setNovoFornecedorNome('');
    // callback externo (persistência)
    if (onAddSupplier) onAddSupplier(novo);
    alert(`Fornecedor ${name} adicionado.`);
  };

  // Lista de fornecedores: junta fornecedores provenientes de stockItems com os locais,
  // mas filtrando para região "Açores" e ilha "Terceira" por defeito quando pedires.
  const fornecedoresDoStock = Array.from(
    new Set(stockItems.map((item) => item.supplier).filter(Boolean))
  ).map((name) => ({ id: `from-stock-${name}`, name } as Supplier));

  // Combina listas, deduplica por nome
  const combinedSuppliersMap = new Map<string, Supplier>();
  [...localSuppliers, ...fornecedoresDoStock].forEach((s) => {
    if (!combinedSuppliersMap.has(s.name)) combinedSuppliersMap.set(s.name, s);
  });
  const combinedSuppliers = Array.from(combinedSuppliersMap.values());

  // Aplicar filtro por região/island se desejado (atualmente, se quiseres só Açores/Terceira, podes filtrar assim)
  const fornecedoresAcoresTerceira = combinedSuppliers.filter(
    (s) =>
      (s.region && s.region.toLowerCase().includes('açores')) ||
      (s.region && s.region.toLowerCase().includes('azores')) ||
      (s.island && s.island.toLowerCase().includes('terceira')) ||
      s.name.toLowerCase().includes('terceira') ||
      s.name.toLowerCase().includes('açores') ||
      s.name.toLowerCase().includes('azores')
  );

  // O select de filtro mostra "Todos" + fornecedores da lista combinada
  const listaFornecedores = combinedSuppliers.map((s) => s.name) as string[];

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

  // -----------------------------
  // OCR / Leitura de Faturas (client-side)
  // -----------------------------
  const [processingInvoice, setProcessingInvoice] = useState(false);
  const [invoiceText, setInvoiceText] = useState<string | null>(null);
  const [invoiceExtract, setInvoiceExtract] = useState<{ supplier?: string; total?: string; date?: string } | null>(
    null
  );

  // Handler de upload de ficheiro (imagem ou PDF). Usa tesseract.js dinamicamente.
  const handleInvoiceUpload = async (file: File | null) => {
    if (!file) return;
    setProcessingInvoice(true);
    setInvoiceText(null);
    setInvoiceExtract(null);

    try {
      // Import dinamicamente para evitar aumentar bundle se não for usado
      const { createWorker } = await import('tesseract.js');

      // Se for PDF, renderizar primeira página para canvas usando pdfjs-dist
      let imageDataUrl: string | null = null;
      if (file.type === 'application/pdf') {
        // pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        // Garantir worker do pdfjs (fallback para CDN se necessário)
        try {
          // @ts-ignore
          if (pdfjsLib && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            // @ts-ignore
            const version = pdfjsLib.version || 'latest';
            // @ts-ignore
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
          }
        } catch (e) {
          // se falhar, não bloqueia; apenas log para debug
          console.warn('Não foi possível configurar pdfjs workerSrc automaticamente:', e);
        }
        // worker src might need setting depending on bundler; we use default if packaging provides it.
        // carregar o PDF como array buffer
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        // criar canvas
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        imageDataUrl = canvas.toDataURL('image/png');
      } else {
        // imagem: criar dataURL direto
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (!imageDataUrl) throw new Error('Não foi possível converter a fatura em imagem.');

      const worker = createWorker({
        logger: (m: any) => {
          // console.log(m);
        }
      });
      await worker.load();
      await worker.loadLanguage('por+eng'); // tenta português + inglês
      await worker.initialize('por+eng');
      const {
        data: { text }
      } = await worker.recognize(imageDataUrl);
      await worker.terminate();

      setInvoiceText(text);

      // Extração heurística: procurar fornecedor (linhas com NIF, "Fornecedor", total, "Total"), valor, data
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

      // regex para valores monetários
      const moneyRe = /([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2}))/g;
      const dateRe = /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})/; // dd/mm/yyyy etc

      let foundTotal: string | undefined;
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i].toLowerCase();
        if (l.includes('total') || l.includes('valor a pagar') || l.includes('valor total') || l.includes('montante')) {
          const m = lines[i].match(moneyRe);
          if (m && m.length > 0) {
            foundTotal = m[m.length - 1];
            break;
          }
        }
      }
      // fallback: último valor monetário no texto
      if (!foundTotal) {
        const allMoney = text.match(moneyRe);
        if (allMoney && allMoney.length > 0) foundTotal = allMoney[allMoney.length - 1];
      }

      // procurar data
      let foundDate: string | undefined;
      for (const l of lines) {
        const m = l.match(dateRe);
        if (m) {
          foundDate = m[1];
          break;
        }
      }

      // procurar fornecedor: heurística - primeiras linhas contendo palavras-chave ou com NIF
      let foundSupplier: string | undefined;
      const nifRe = /(NIF|N.º Identificação Fiscal|NIF:|NIF\s*[:\-])/i;
      for (let i = 0; i < Math.min(6, lines.length); i++) {
        const l = lines[i];
        if (nifRe.test(l) || /fornecedor|empresa|emitente/i.test(l)) {
          // assumir a linha anterior/atual como nome
          foundSupplier = lines[i - 1] || lines[i];
          break;
        }
      }
      // fallback: primeira linha não vazia
      if (!foundSupplier && lines.length > 0) {
        foundSupplier = lines[0];
      }

      setInvoiceExtract({
        supplier: foundSupplier,
        total: foundTotal,
        date: foundDate
      });

      // Sugestão: preencher automaticamente o campo fornecedor se for detectado
      if (foundSupplier) {
        setFornecedor(foundSupplier);
      }
    } catch (err) {
      console.error('Erro ao processar fatura:', err);
      alert('Erro ao processar a fatura. Vê o console para mais detalhes.');
    } finally {
      setProcessingInvoice(false);
    }
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
              placeholder="Ex: Laticínios Terceira"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              list="lista-fornecedores-sugestoes"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <datalist id="lista-fornecedores-sugestoes">
              {/* Mostrar apenas fornecedores dos Açores / Terceira em sugestões (se existirem) */}
              {(fornecedoresAcoresTerceira.length > 0 ? fornecedoresAcoresTerceira : combinedSuppliers).map((forn, idx) => (
                <option key={idx} value={forn.name} />
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
          <div className="md:col-span-3 lg:col-span-5 flex justify-between items-center mt-2">
            <div>
              <input
                type="file"
                accept="image/*,application/pdf"
                id="invoice-uploader"
                onChange={(e) => handleInvoiceUpload(e.target.files ? e.target.files[0] : null)}
                className="text-xs"
              />
              {processingInvoice && <span className="ml-2 text-xs text-slate-500">A processar fatura...</span>}
              {invoiceExtract && (
                <div className="mt-2 text-xs text-slate-600">
                  <div>Fornecedor detectado: <strong>{invoiceExtract.supplier || '—'}</strong></div>
                  <div>Total detectado: <strong>{invoiceExtract.total || '—'}</strong></div>
                  <div>Data detectada: <strong>{invoiceExtract.date || '—'}</strong></div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <PlusCircle className="w-4 h-4" /> Confirmar Compra e Adicionar ao FEFO
              </button>
            </div>
          </div>
        </form>

        {/* UI para adicionar novo fornecedor */}
        <div className="mt-4 border-t pt-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            Adicionar Novo Fornecedor (Açores / Terceira)
          </h4>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Nome do Fornecedor"
              value={novoFornecedorNome}
              onChange={(e) => setNovoFornecedorNome(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
            <select
              value={novoFornecedorIsland}
              onChange={(e) => setNovoFornecedorIsland(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            >
              <option>Terceira</option>
              <option>Pico</option>
              <option>São Miguel</option>
              <option>Faial</option>
            </select>
            <button
              onClick={handleAddSupplier}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              type="button"
            >
              Adicionar Fornecedor
            </button>
          </div>
        </div>
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
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg font-medium text-[11px] transition flex items-center gap-1"
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
