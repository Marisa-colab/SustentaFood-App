import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WasteLogView } from './components/WasteLogView';
import { WasteLogModal } from './components/WasteLogModal';
import { EconomicAnalysisView } from './components/EconomicAnalysisView';
import { StockFefoView } from './components/StockFefoView';
import { DonationView } from './components/DonationView';
import { ValorizationView } from './components/ValorizationView';
import { HaccpView } from './components/HaccpView';
import { AIPredictionsView } from './components/AIPredictionsView';
import { ReportsView } from './components/ReportsView';
import { AlertsView } from './components/AlertsView';

// 🛡️ Licença e Backoffice
import { LicenseGuard, LicenseBadge } from './components/LicenseGuard';
import { AdminBackofficeView } from './components/AdminBackofficeView';

// 📄 Tipos
import {
  WasteLog,
  StockItem,
  StockMovement,
  DonationLog,
  ValorizationLog,
  HaccpLog,
  AlertItem,
  SummaryMetrics,
  WasteCategory,
  LicenseInfo
} from './types';

import {
  initialWasteLogs,
  initialStockItems,
  initialStockMovements,
  initialDonations,
  initialValorizationLogs,
  initialHaccpLogs,
  initialAlerts
} from './mockData';

export function App() {
  // 🔑 Estado da Sessão Supabase
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 🔑 Estado da Licença do Cliente e Modo Vendedor (Super Admin)
  const [license, setLicense] = useState<LicenseInfo>({
    clientName: 'Restaurante Sustenta',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    planType: 'Enterprise',
    licenseKey: 'SUSTENTA-2026-PRO',
    isActive: true,
  });

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  // Core Application Data State
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(initialWasteLogs);
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [donations, setDonations] = useState<DonationLog[]>(initialDonations);
  const [valorizationLogs, setValorizationLogs] = useState<ValorizationLog[]>(initialValorizationLogs);
  const [haccpLogs, setHaccpLogs] = useState<HaccpLog[]>(initialHaccpLogs);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

  const [highlightPrediction, setHighlightPrediction] = useState<string>(
    'Para amanhã prevê-se um excedente de 25 kg de sopa devido à baixa procura das últimas 4 semanas.'
  );

  // Modals & Prefills
  const [isNewWasteModalOpen, setIsNewWasteModalOpen] = useState(false);
  const [prefillDonationItem, setPrefillDonationItem] = useState<{ name: string; category: WasteCategory; quantity: number } | null>(null);

  // -----------------------------
  // Filters (global)
  // -----------------------------
  const [filterFrom, setFilterFrom] = useState<string | null>(null); // yyyy-mm-dd
  const [filterTo, setFilterTo] = useState<string | null>(null); // yyyy-mm-dd
  const [filterCategory, setFilterCategory] = useState<WasteCategory | 'all'>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [minQuantity, setMinQuantity] = useState<number | ''>('');
  const [maxQuantity, setMaxQuantity] = useState<number | ''>('');
  const [minCost, setMinCost] = useState<number | ''>('');
  const [maxCost, setMaxCost] = useState<number | ''>('');

  const resetFilters = () => {
    setFilterFrom(null);
    setFilterTo(null);
    setFilterCategory('all');
    setFilterQuery('');
    setMinQuantity('');
    setMaxQuantity('');
    setMinCost('');
    setMaxCost('');
  };

  // -----------------------------
  // Supabase session handling
  // -----------------------------
  useEffect(() => {
    let mounted = true;
    // obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoadingSession(false);
    }).catch(() => {
      if (!mounted) return;
      setLoadingSession(false);
    });

    // ouvir mudanças de autenticação
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setLoadingSession(false);
    });

    const subscription = data?.subscription;

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Today Date
  const todayStr = new Date().toISOString().split('T')[0];

  // -----------------------------
  // Filtering logic
  // -----------------------------
  const parseDate = (s?: string | null) => (s ? new Date(s) : null);

  const applyWasteFilters = (logs: WasteLog[]) => {
    const fromDate = parseDate(filterFrom);
    const toDate = parseDate(filterTo);

    return logs.filter((l) => {
      // date
      const logDate = parseDate(l.date as string);
      if (fromDate && (!logDate || logDate < fromDate)) return false;
      if (toDate && (!logDate || logDate > toDate)) return false;

      // category
      if (filterCategory !== 'all' && l.category !== filterCategory) return false;

      // quantity
      if (minQuantity !== '' && typeof minQuantity === 'number' && l.quantity < minQuantity) return false;
      if (maxQuantity !== '' && typeof maxQuantity === 'number' && l.quantity > maxQuantity) return false;

      // cost
      if (minCost !== '' && typeof minCost === 'number' && l.totalCost < minCost) return false;
      if (maxCost !== '' && typeof maxCost === 'number' && l.totalCost > maxCost) return false;

      // text query (match name, notes, category)
      if (filterQuery && filterQuery.trim().length > 0) {
        const q = filterQuery.trim().toLowerCase();
        const name = (l.name || l.itemName || '') as string;
        const notes = (l.notes || '') as string;
        const category = String(l.category || '');
        const hay = `${name} ${notes} ${category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  };

  const filteredWasteLogs = applyWasteFilters(wasteLogs);

  // Dynamic Metrics Calculation (based on filtered logs)
  const totalWasteKgToday = filteredWasteLogs
    .filter((l) => l.date === todayStr)
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const totalWasteKgMonth = filteredWasteLogs.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCostLostMonth = filteredWasteLogs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalCo2eKgMonth = filteredWasteLogs.reduce((acc, curr) => acc + curr.co2eKg, 0);
  const mealsServedMonth = 4720;
  const kgPerMeal = mealsServedMonth > 0 ? totalWasteKgMonth / mealsServedMonth : 0;
  const kgPerDayAvg = 30 > 0 ? totalWasteKgMonth / 30 : 0;

  const summaryMetrics: SummaryMetrics = {
    totalWasteKgToday,
    totalWasteKgMonth,
    totalCostLostMonth,
    totalCo2eKgMonth,
    potentialSavingsMonth: totalCostLostMonth * 0.5,
    mealsServedMonth,
    kgPerMeal,
    kgPerDayAvg,
    reductionGoalPercent: 25,
    currentReductionPercent: 18.5
  };

  // Handlers
  const handleUpdateLicense = (updatedLicense: LicenseInfo) => {
    setLicense(updatedLicense);
  };

  const handleAddWasteLog = (newLogData: Omit<WasteLog, 'id'>) => {
    const newId = `LOG-${1000 + wasteLogs.length + 1}`;
    const newLog: WasteLog = { id: newId, ...newLogData };
    setWasteLogs([newLog, ...wasteLogs]);
  };

  const handleDeleteWasteLog = (id: string) => {
    setWasteLogs(wasteLogs.filter((l) => l.id !== id));
  };

  const handleAddStockMovement = (movData: Omit<StockMovement, 'id'>) => {
    const newId = `MOV-${500 + stockMovements.length + 1}`;
    const newMov: StockMovement = { id: newId, ...movData };
    setStockMovements([newMov, ...stockMovements]);

    // Update stock quantity
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === movData.stockItemId) {
          const qtyChange = movData.type === 'Entrada' ? movData.quantity : -movData.quantity;
          const newQty = Math.max(0, item.quantity + qtyChange);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleAddDonation = (newDonData: Omit<DonationLog, 'id'>) => {
    const newId = `DON-2026-${(donations.length + 1).toString().padStart(2, '0')}`;
    const newDonation: DonationLog = { id: newId, ...newDonData };
    setDonations([newDonation, ...donations]);
  };

  const handleOpenDonationFromStock = (name: string, category: WasteCategory, quantity: number) => {
    setPrefillDonationItem({ name, category, quantity });
    setActiveTab('donations');
  };

  const handleAddValorizationLog = (valData: Omit<ValorizationLog, 'id'>) => {
    const newId = `VAL-${(valorizationLogs.length + 1).toString().padStart(2, '0')}`;
    const newVal: ValorizationLog = { id: newId, ...valData };
    setValorizationLogs([newVal, ...valorizationLogs]);
  };

  const handleAddHaccpLog = (haccpData: Omit<HaccpLog, 'id'>) => {
    const newId = `HACCP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newHaccp: HaccpLog = { id: newId, ...haccpData };
    setHaccpLogs([newHaccp, ...haccpLogs]);
  };

  const handleMarkAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const handleClearAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  // helper: extract available categories from logs (for select options)
  const availableCategories = Array.from(new Set(wasteLogs.map((l) => String(l.category)))) as WasteCategory[];

  // 1️⃣ Ecrã de carregamento inicial de sessão
  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <p className="animate-pulse font-medium text-emerald-400">A validar sessão no SustentaFood...</p>
      </div>
    );
  }

  // 2️⃣ Se NÃO houver utilizador autenticado, renderiza a vista de Login
  if (!session) {
    return <LoginView />;
  }

  // 3️⃣ Se ESTIVER autenticado, renderiza toda a aplicação
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 🔝 Barra Superior Global: Sessão + Badge da Licença + Alternador para o Backoffice */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-emerald-400 tracking-wide">SustentaFood</span>
          <span className="text-slate-700">|</span>
          <LicenseBadge license={license} />
        </div>

        <div className="flex items-center gap-3">
          {/* Email do Utilizador Autenticado */}
          <span className="text-slate-300 font-mono hidden sm:inline">{session?.user?.email}</span>
          
          {/* Botão de Terminar Sessão */}
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-2.5 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition font-medium text-xs"
          >
            Sair
          </button>

          <span className="text-slate-700">|</span>

          {/* Alternador Backoffice */}
          <button
            onClick={() => setIsSuperAdmin(!isSuperAdmin)}
            className="px-3 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition font-medium flex items-center gap-1.5"
          >
            {isSuperAdmin ? '← Voltar à Aplicação Cliente' : '⚙️ Backoffice Vendedor'}
          </button>
        </div>
      </div>

      {/* Filters bar (global) */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">De</label>
            <input
              type="date"
              value={filterFrom ?? ''}
              onChange={(e) => setFilterFrom(e.target.value || null)}
              className="px-2 py-1 border rounded bg-slate-50 text-sm"
            />
            <label className="text-xs text-slate-500">Até</label>
            <input
              type="date"
              value={filterTo ?? ''}
              onChange={(e) => setFilterTo(e.target.value || null)}
              className="px-2 py-1 border rounded bg-slate-50 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory((e.target.value as WasteCategory) || 'all')}
              className="px-2 py-1 border rounded bg-slate-50 text-sm"
            >
              <option value="all">Todas</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              placeholder="Pesquisar (nome, notas)"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="px-2 py-1 border rounded bg-slate-50 text-sm w-56"
            />

            <input
              type="number"
              placeholder="Qtd min"
              value={minQuantity === '' ? '' : String(minQuantity)}
              onChange={(e) => setMinQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="px-2 py-1 border rounded bg-slate-50 text-sm w-24"
            />
            <input
              type="number"
              placeholder="Qtd max"
              value={maxQuantity === '' ? '' : String(maxQuantity)}
              onChange={(e) => setMaxQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="px-2 py-1 border rounded bg-slate-50 text-sm w-24"
            />

            <input
              type="number"
              placeholder="Custo min"
              step="0.01"
              value={minCost === '' ? '' : String(minCost)}
              onChange={(e) => setMinCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="px-2 py-1 border rounded bg-slate-50 text-sm w-28"
            />
            <input
              type="number"
              placeholder="Custo max"
              step="0.01"
              value={maxCost === '' ? '' : String(maxCost)}
              onChange={(e) => setMaxCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="px-2 py-1 border rounded bg-slate-50 text-sm w-28"
            />

            <button
              onClick={resetFilters}
              className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* ⚙️ Se o modo Super Admin estiver ativo, mostra o Backoffice diretamente */}
      {isSuperAdmin ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AdminBackofficeView
            licenses={[license]}
            onUpdateLicense={handleUpdateLicense}
          />
        </main>
      ) : (
        /* 🔒 Proteção de Licença: Se a licença expirar/for revogada, bloqueia o ecrã do cliente */
        <LicenseGuard license={license}>
          {/* App Navigation Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadAlertCount={unreadAlertCount}
            onOpenNewWasteModal={() => setIsNewWasteModalOpen(true)}
          />

          {/* View Content Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView
                wasteLogs={filteredWasteLogs}
                metrics={summaryMetrics}
                alerts={alerts}
                highlightPrediction={highlightPrediction}
                onOpenNewWasteModal={() => setIsNewWasteModalOpen(true)}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'waste_logs' && (
              <WasteLogView
                logs={filteredWasteLogs}
                onOpenNewModal={() => setIsNewWasteModalOpen(true)}
                onDeleteLog={handleDeleteWasteLog}
              />
            )}

            {activeTab === 'economic' && (
              <EconomicAnalysisView
                metrics={summaryMetrics}
                wasteLogs={filteredWasteLogs}
              />
            )}

            {activeTab === 'stock_fefo' && (
              <StockFefoView
                stockItems={stockItems}
                stockMovements={stockMovements}
                onAddMovement={handleAddStockMovement}
                onOpenDonationModalWithItem={handleOpenDonationFromStock}
              />
            )}

            {activeTab === 'donations' && (
              <DonationView
                donations={donations}
                onAddDonation={handleAddDonation}
                prefillItem={prefillDonationItem}
              />
            )}

            {activeTab === 'valorization' && (
              <ValorizationView
                valorizationLogs={valorizationLogs}
                onAddValorizationLog={handleAddValorizationLog}
              />
            )}

            {activeTab === 'haccp' && (
              <HaccpView
                haccpLogs={haccpLogs}
                onAddHaccpLog={handleAddHaccpLog}
              />
            )}

            {activeTab === 'ai_forecast' && (
              <AIPredictionsView
                wasteLogs={filteredWasteLogs}
                stockItems={stockItems}
                highlightPrediction={highlightPrediction}
                setHighlightPrediction={setHighlightPrediction}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                metrics={summaryMetrics}
                wasteLogs={filteredWasteLogs}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onMarkAsRead={handleMarkAlertAsRead}
                onClearAll={handleClearAllAlerts}
                setActiveTab={setActiveTab}
              />
            )}
          </main>

          {/* Global New Waste Log Modal */}
          <WasteLogModal
            isOpen={isNewWasteModalOpen}
            onClose={() => setIsNewWasteModalOpen(false)}
            onAddWasteLog={handleAddWasteLog}
          />
        </LicenseGuard>
      )}
    </div>
  );
}

export default App;
