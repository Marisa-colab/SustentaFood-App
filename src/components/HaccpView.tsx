import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  AlertOctagon,
  Thermometer,
  FileCheck,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { HaccpLog } from '../types';

interface HaccpViewProps {
  haccpLogs: HaccpLog[];
  onAddHaccpLog: (log: Omit<HaccpLog, 'id'>) => void;
}

export const HaccpView: React.FC<HaccpViewProps> = ({
  haccpLogs,
  onAddHaccpLog
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form
  const [productName, setProductName] = useState('Salmão Inteiro Fresco');
  const [batchNumber, setBatchNumber] = useState('LOTE-SAL-2026-081');
  const [supplier, setSupplier] = useState('Lota de Peniche / Mariscos Lda');
  const [quantityKg, setQuantityKg] = useState<number>(10);
  const [rejectionReason, setRejectionReason] = useState<
    'Quebra de Temperatura' | 'Prazo Excedido' | 'Embalagem Danificada' | 'Anomalia Organoléptica' | 'Contaminação Cruzada' | 'Outro'
  >('Quebra de Temperatura');
  const [temperatureLogged, setTemperatureLogged] = useState<number>(8.8);
  const [correctiveAction, setCorrectiveAction] = useState('Produto rejeitado na receção. Devolução ao fornecedor com emissão de guia de não conformidade.');
  const [responsible, setResponsible] = useState('João Silva (Responsável HACCP)');

  const filteredLogs = haccpLogs.filter((log) =>
    log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.nonConformityCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || quantityKg <= 0) return;

    const ncCode = `NC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    onAddHaccpLog({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      productName: productName.trim(),
      batchNumber: batchNumber.trim(),
      supplier: supplier.trim(),
      quantityKg,
      rejectionReason,
      temperatureLogged: rejectionReason === 'Quebra de Temperatura' ? temperatureLogged : undefined,
      nonConformityCode: ncCode,
      correctiveAction: correctiveAction.trim(),
      status: 'Ação Executada',
      responsible: responsible.trim()
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">HACCP & Controlo de Segurança Alimentar</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">
              Auditoria & Não Conformidades
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registo obrigatório de rejeições de produtos, desvios de temperatura, ações corretivas e rastreabilidade por lote
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Rejeição / Não Conformidade</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Rejeições Registadas</span>
            <div className="text-2xl font-bold mt-0.5">{haccpLogs.length} Ocorrências</div>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-xl text-amber-400 border border-slate-700">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Ações Corretivas Executadas</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">100% Tratadas</div>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400 border border-slate-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Conformidade HACCP</span>
            <div className="text-2xl font-bold text-sky-400 mt-0.5">Auditável</div>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-xl text-sky-400 border border-slate-700">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" />
        <input
          type="text"
          placeholder="Pesquisar por produto, lote, fornecedor, código de NC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Código NC / Data</th>
                <th className="px-4 py-3.5">Produto & Lote</th>
                <th className="px-4 py-3.5">Fornecedor</th>
                <th className="px-4 py-3.5">Motivo da Rejeição</th>
                <th className="px-4 py-3.5 text-right">Qtd Rejeitada</th>
                <th className="px-4 py-3.5">Ação Corretiva</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.nonConformityCode}
                    <span className="block font-sans text-[10px] text-slate-500">{log.date} {log.time}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block text-sm">{log.productName}</span>
                    <span className="text-[10px] font-mono text-slate-500">Lote: {log.batchNumber}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{log.supplier}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200 inline-block">
                      {log.rejectionReason}
                    </span>
                    {log.temperatureLogged !== undefined && (
                      <span className="text-[10px] font-bold text-rose-700 block mt-1 flex items-center gap-0.5">
                        <Thermometer className="w-3 h-3" /> Registo: {log.temperatureLogged}ºC
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-rose-600 text-sm">{log.quantityKg} kg</td>
                  <td className="px-4 py-3.5 text-slate-700 max-w-xs">{log.correctiveAction}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[10px] flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Registar Não Conformidade HACCP</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Produto Rejeitado *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N.º do Lote *</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fornecedor *</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Motivo da Rejeição *</label>
                  <select
                    value={rejectionReason}
                    onChange={(e: any) => setRejectionReason(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border font-medium"
                  >
                    <option value="Quebra de Temperatura">Quebra de Temperatura</option>
                    <option value="Prazo Excedido">Prazo Excedido</option>
                    <option value="Embalagem Danificada">Embalagem Danificada</option>
                    <option value="Anomalia Organoléptica">Anomalia Organoléptica</option>
                    <option value="Contaminação Cruzada">Contaminação Cruzada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qtd Rejeitada (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded border font-bold"
                  />
                </div>
              </div>

              {rejectionReason === 'Quebra de Temperatura' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperatura Registada (ºC)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureLogged}
                    onChange={(e) => setTemperatureLogged(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border font-bold text-rose-600"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ação Corretiva Executada *</label>
                <textarea
                  rows={2}
                  required
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsável HACCP</label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold shadow"
                >
                  Confirmar e Registar NC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
