// --- LICENÇA ---
export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'trial';

export interface LicenseInfo {
  clientName: string;
  licenseKey?: string;
  startDate?: string;
  endDate?: string;
  validUntil?: string;
  status?: string;
  planType?: 'Restauração' | 'Supermercado' | 'Enterprise' | string;
  licenseType?: string;
  isActive: boolean;
}

export interface Compra {
  id: string;
  fornecedor: string;
  produto: string;
  quantidade: number;
  preco: number;
  validade: string; // YYYY-MM-DD
  dataCompra: string;
}

export interface LoteStock extends Compra {
  quantidadeRestante: number;
}

// --- TIPOS DE DESPERDÍCIO ---
export type WasteCategory =
  | 'Carne'
  | 'Peixe'
  | 'Frutas'
  | 'Legumes'
  | 'Lacticínios'
  | 'Padaria'
  | 'Refeições Confecionadas'
  | 'Outros';
    
export interface WasteLog {
  id: string;
  item: string;
  category: WasteCategory | string;
  type: string;
  quantity: number;
  unit: string;
  supplier?: string;
  costPerUnit: number;
  salePricePerUnit?: number;
  totalCost: number;
  totalPotentialRevenue?: number;
  date: string;
  time: string;
  location: string; // Permite qualquer localização sem dar erro de TypeScript
  responsible: string;
  notes?: string;
  co2eKg: number;
}

// --- STOCK & FEFO ---
export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  costPerUnit: number;
  storageType: string;
  minStockThreshold: number;
  fefoPriority: 'Crítico' | 'Atenção' | 'Normal';
  supplier: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  itemName: string;
  type: 'Entrada' | 'Saída' | 'Ajuste / Inventário';
  quantity: number;
  unit: string;
  date: string;
  responsible: string;
  reason: string;
}

// --- DOAÇÕES & VALORIZAÇÃO ---
export interface DonationItem {
  name: string;
  category: string;
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
  status: string;
  certificateCode: string;
  receiptNotes: string;
}

export interface ValorizationLog {
  id: string;
  destination: string;
  quantityKg: number;
  date: string;
  partnerEntity: string;
  co2SavedKg: number;
  responsible: string;
  notes: string;
}

// --- HACCP & ALERTAS ---
export interface HaccpLog {
  id: string;
  date: string;
  time: string;
  productName: string;
  batchNumber: string;
  supplier: string;
  quantityKg: number;
  rejectionReason: string;
  temperatureLogged?: number;
  nonConformityCode: string;
  correctiveAction: string;
  status: string;
  responsible: string;
}

export interface AlertItem {
  id: string;
  type: 'expiring_soon' | 'waste_threshold' | 'excess_purchase';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedCategory: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  impact: string;
  actionableStep: string;
}

// --- Gestão de Licenças (Backoffice) ---
export interface LicencaCliente {
  id: string;
  nomeCliente: string;
  emailCliente: string;
  dataInicio: string;  // Formato: "YYYY-MM-DD"
  dataTermo: string;   // Formato: "YYYY-MM-DD"
  tipoPlano: 'Básico' | 'Pro' | 'Empresarial';
  estaAtivo: boolean;  // Autorização manual dada pelo vendedor
}
