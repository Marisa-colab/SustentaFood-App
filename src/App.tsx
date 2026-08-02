import React, { useState } from 'react';
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

import {
  WasteLog,
  StockItem,
  StockMovement,
  DonationLog,
  ValorizationLog,
  HaccpLog,
  AlertItem,
  SummaryMetrics,
  WasteCategory
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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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

  // Today Date
  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic Metrics Calculation
  const totalWasteKgToday = wasteLogs
    .filter((l) => l.date === todayStr || l.date === '2026-08-01')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const totalWasteKgMonth = wasteLogs.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCostLostMonth = wasteLogs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalCo2eKgMonth = wasteLogs.reduce((acc, curr) => acc + curr.co2eKg, 0);
  const mealsServedMonth = 4720;
  const kgPerMeal = totalWasteKgMonth / mealsServedMonth;
  const kgPerDayAvg = totalWasteKgMonth / 30;

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

  // Handlers for Adding & Deleting Data
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertCount={unreadAlertCount}
        onOpenNewWasteModal={() => setIsNewWasteModalOpen(true)}
      />

      {/* View Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            wasteLogs={wasteLogs}
            metrics={summaryMetrics}
            alerts={alerts}
            highlightPrediction={highlightPrediction}
            onOpenNewWasteModal={() => setIsNewWasteModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'waste_logs' && (
          <WasteLogView
            logs={wasteLogs}
            onOpenNewModal={() => setIsNewWasteModalOpen(true)}
            onDeleteLog={handleDeleteWasteLog}
          />
        )}

        {activeTab === 'economic' && (
          <EconomicAnalysisView
            metrics={summaryMetrics}
            wasteLogs={wasteLogs}
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
            wasteLogs={wasteLogs}
            stockItems={stockItems}
            highlightPrediction={highlightPrediction}
            setHighlightPrediction={setHighlightPrediction}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            metrics={summaryMetrics}
            wasteLogs={wasteLogs}
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
    </div>
  );
}
