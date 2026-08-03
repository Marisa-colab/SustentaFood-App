import React from 'react';
import { LicenseInfo, LicenseStatus } from '../types'; // Ajusta o caminho se o teu ficheiro for 'types'
import { ShieldCheck, ShieldAlert, Lock, Calendar, PhoneCall } from 'lucide-react';

interface LicenseGuardProps {
  license: LicenseInfo;
  children: React.ReactNode;
}

function safeParseDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function LicenseGuard({ license, children }: LicenseGuardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = safeParseDate(license.endDate);
  let daysRemaining = Infinity;

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const diffTime = end.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Determinar Estado (Bloqueia se caducou OU se foi desativado manualmente)
  let status: LicenseStatus = 'active';

  if (!license.isActive) {
    status = 'expired';
  } else if (endDate && daysRemaining <= 0) {
    status = 'expired';
  } else if (endDate && daysRemaining <= 7) {
    status = 'expiring_soon';
  }

  // 🔴 ECRÃ DE BLOQUEIO (Se a licença tiver expirado ou sido revogada)
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Acesso Suspenso</h2>
          <p className="text-slate-400 text-sm mb-6">
            A subscrição do <span className="font-semibold text-emerald-400">{license.clientName}</span> {!license.isActive ? 'foi desativada pelo administrador' : endDate ? `terminou a ${license.endDate}` : 'não tem uma data de validade válida'}.
          </p>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-6 text-left space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Plano:</span>
              <span className="font-medium text-white">{license.planType}</span>
            </div>
            {license.licenseKey && (
              <div className="flex justify-between">
                <span className="text-slate-500">Chave da Licença:</span>
                <span className="font-mono text-emerald-400">{license.licenseKey}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Estado:</span>
              <span className="font-semibold text-red-400">
                {!license.isActive ? 'Revogado Manualmente' : 'Expirado'}
              </span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-emerald-300 font-medium mb-1 flex items-center justify-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Para renovar ou reativar o acesso:
            </p>
            <p className="text-sm font-bold text-white">Contacte a equipa SustentaFood</p>
          </div>

          <p className="text-[11px] text-slate-500">
            SustentaFood © {new Date().getFullYear()} — Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // 🟢 SE A LICENÇA ESTIVER ATIVA, MOSTRA A APLICAÇÃO
  return <>{children}</>;
}

// 🏷️ COMPONENTE DO ÍCONE DE STATUS PARA COLOCAR NO HEADER
export function LicenseBadge({ license }: { license: LicenseInfo }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = safeParseDate(license.endDate);
  let daysRemaining = Infinity;

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const diffTime = end.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const isExpiringSoon = typeof daysRemaining === 'number' && daysRemaining <= 7;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
      isExpiringSoon 
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
    }`}>
      {isExpiringSoon ? (
        <ShieldAlert className="w-4 h-4 text-amber-500" />
      ) : (
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
      )}
      <span>Licença Ativa</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1 font-mono">
        <Calendar className="w-3 h-3 opacity-70" />
        {daysRemaining !== Infinity ? (daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expira hoje') : 'Sem data'} ({license.endDate ?? '—'})
      </span>
    </div>
  );
}
