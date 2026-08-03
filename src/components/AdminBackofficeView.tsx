import React, { useState } from 'react';
import { LicenseInfo } from '../tipos';
import { ShieldCheck, ShieldAlert, UserX, UserCheck, Calendar, Lock, Unlock, Search } from 'lucide-react';

interface AdminBackofficeViewProps {
  licenses: LicenseInfo[];
  onUpdateLicense: (updatedLicense: LicenseInfo) => void;
}

export const AdminBackofficeView: React.FC<AdminBackofficeViewProps> = ({
  licenses,
  onUpdateLicense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const calculateStatus = (lic: LicenseInfo) => {
    if (!lic.isActive) {
      return { label: 'Revogado', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(lic.endDate);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return { label: 'Expirado', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
    if (diffDays <= 7) return { label: `Expira em ${diffDays}d`, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const filtered = licenses.filter(
    (l) =>
      l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.licenseKey && l.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Painel de Administração de Licenças
            </h2>
            <p className="text-xs text-slate-400">
              Área restrita ao vendedor para gestão de validades, renovações e bloqueios.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Cliente / Empresa</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Data Início</th>
                <th className="p-3">Data Termo</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-center">Ações de Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((lic) => {
                const status = calculateStatus(lic);
                return (
                  <tr key={lic.clientName} className="hover:bg-slate-700/30 transition">
                    <td className="p-3">
                      <div className="font-semibold text-white">{lic.clientName}</div>
                      {lic.licenseKey && (
                        <div className="font-mono text-[10px] text-slate-500">{lic.licenseKey}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-700 rounded border border-slate-600 font-medium">
                        {lic.planType}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={lic.startDate}
                        onChange={(e) =>
                          onUpdateLicense({ ...lic, startDate: e.target.value })
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={lic.endDate}
                        onChange={(e) =>
                          onUpdateLicense({ ...lic, endDate: e.target.value })
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-medium"
                      />
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          onUpdateLicense({ ...lic, isActive: !lic.isActive })
                        }
                        className={`flex items-center gap-1 mx-auto px-3 py-1.5 rounded-lg font-semibold transition text-xs ${
                          lic.isActive
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {lic.isActive ? (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Bloquear Acesso
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" /> Autorizar Acesso
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
