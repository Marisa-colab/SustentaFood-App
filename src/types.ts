export type LicenseStatus = 'active' | 'expiring_soon' | 'expired';

export interface LicenseInfo {
  clientName: string;         // Nome da empresa / cliente
  licenseKey: string;         // Código único da licença
  startDate: string;          // Data de início (YYYY-MM-DD)
  endDate: string;            // Data de termo (YYYY-MM-DD)
  planType: 'Restauração' | 'Supermercado' | 'Enterprise';
  maxUsers?: number;
}

export type WasteCategory =
  | 'Carne'
  | 'Peixe'
  | 'Frutas'
  | 'Legumes'
  | 'Lacticínios'
  | 'Padaria'
  | 'Refeições Confecionadas'
  | 'Outros';

export type WasteType =
  | 'Sobras de refeições'
  | 'Produtos fora de prazo'
  | 'Restos de preparação'
  | 'Alimentos devolvidos'
  | 'Avaria / Falha de frio'
  | 'Outro';

export type ProductionLocation =
 // 🏬 Locais que cobrem tanto Restaurante como Supermercado
export type LocationType =
  | 'Armazém / Câmara Fria'
  | 'Talho / Peixaria'
  | 'Charcutaria / Lacticínios'
  | 'Prateleira / Gôndola (Loja)'
  | 'Padaria / Pastelaria'
  | 'Cozinha Central / Take-Away'
  | 'Empratamento / Buffet'
  | 'Sala de Refeições / Bar';

export interface WasteLog {
  id: string;
  item: string;
  category: WasteCategory;
  type: WasteType;
  quantity: number;
  unit: 'kg' | 'L' | 'un';
  
  // ─── CAMPOS FINANCEIROS (Essenciais para Supermercado) ───
  supplier?: string;              // Nome do Fornecedor (ex: Lactogal)
  costPerUnit: number;            // Preço Pago ao Fornecedor (€)
  salePricePerUnit?: number;      // Preço de Venda ao Público / PVP (€)
  totalCost: number;              // Perda em Custo (€)
  totalPotentialRevenue?: number; // Faturação Perdida (€)
  // ─────────────────────────────────────────────────────────

  date: string;
  time: string;
  location: LocationType;         // Usa a localização universal
  responsible: string;
  notes?: string;
  co2eKg: number;
}

export interface SummaryMetrics {
  totalWasteKgToday: number;
  totalWasteKgMonth: number;
  totalCostLostMonth: number;
  totalRevenueLostMonth?: number; 
  totalCo2eKgMonth: number;
  potentialSavingsMonth: number;
  
  // Métricas flexíveis:
  mealsServedMonth?: number;      // Para Restaurante (N.º de Refeições)
  customersServedMonth?: number;  // Para Supermercado (N.º de Clientes / Passagens na Caixa)
  
  kgPerMeal?: number;
  kgPerCustomer?: number;
  kgPerDayAvg: number;
  reductionGoalPercent: number;
  currentReductionPercent: number;
}

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: WasteCategory;
  quantity: number;
  unit: 'kg' | 'L' | 'un';
  batchNumber: string;
  expiryDate: string;
  
  // ─── CAMPOS FINANCEIROS DE STOCK ───
  supplier?: string;              // Nome do Fornecedor
  costPerUnit: number;            // Preço Pago ao Fornecedor (€)
  salePricePerUnit?: number;      // Preço de Venda Previsto (€)
  // ───────────────────────────────────

  storageType: 'Refrigerado' | 'Congelado' | 'Seco / Ambiente';
  minStockThreshold: number;
  fefoPriority: 'Crítico' | 'Atenção' | 'Normal';
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  itemName: string;
  type: 'Entrada' | 'Saída' | 'Ajuste / Inventário' | 'Quebra / Desperdício';
  quantity: number;
  unit: string;
  date: string;
  responsible: string;
  reason?: string;
}

export interface DonationItem {
  name: string;
  category: WasteCategory;
  quantity: number;
  unit: string;
  estimatedValue: number;
}

export interface DonationLog {
  id: string;
  institutionName: string;
  nif: string;
  contactPerson: string;
  date: string;
  items: DonationItem[];
  totalKg: number;
  totalValue: number;
  responsible: string;
  status: 'Pendente' | 'Concluída' | 'Em Trânsito';
  certificateCode: string;
  receiptNotes?: string;
}

export interface ValorizationLog {
  id: string;
  destination: 'Compostagem' | 'Alimentação Animal' | 'Biogás / Bioenergia' | 'Reciclagem de Óleos (OAU)' | 'Outro';
  quantityKg: number;
  date: string;
  partnerEntity: string;
  co2SavedKg: number;
  responsible: string;
  notes?: string;
}

export interface HaccpLog {
  id: string;
  date: string;
  time: string;
  productName: string;
  batchNumber: string;
  supplier: string;
  quantityKg: number;
  rejectionReason:
    | 'Quebra de Temperatura'
    | 'Prazo Excedido'
    | 'Embalagem Danificada'
    | 'Anomalia Organoléptica'
    | 'Contaminação Cruzada'
    | 'Outro';
  temperatureLogged?: number;
  nonConformityCode: string;
  correctiveAction: string;
  status: 'Aberto' | 'Ação Executada' | 'Encerrado / Auditado';
  responsible: string;
}

export interface AlertItem {
  id: string;
  type: 'expiring_soon' | 'waste_threshold' | 'excess_purchase' | 'haccp_risk' | 'anomaly';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedCategory?: WasteCategory;
}

export interface AIInsight {
  id: string;
  date: string;
  title: string;
  summary: string;
  type: 'forecast' | 'procurement' | 'waste_risk' | 'trend';
  metricText?: string;
  recommendation: string;
}

export interface SummaryMetrics {
  totalWasteKgToday: number;
  totalWasteKgMonth: number;
  totalCostLostMonth: number;
  totalRevenueLostMonth?: number; // Total da receita de venda perdida no mês
  totalCo2eKgMonth: number;
  potentialSavingsMonth: number;
  mealsServedMonth: number;
  kgPerMeal: number;
  kgPerDayAvg: number;
  reductionGoalPercent: number;
  currentReductionPercent: number;
}